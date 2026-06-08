import { prisma } from "@/lib/prisma";
import { getDiaErpClient } from "./client";
import { createSlug } from "@/lib/utils/slug";
import type { ProxyOrderRequest, ProxyProduct } from "./types";

// Varyant eşleştirme için stok kart kodunu kullanır
function resolveErpVariantCode(product: ProxyProduct): string {
  return product.code;
}

// Fiyat listesinden level 10'u döner
function resolvePrice(product: ProxyProduct): number {
  const level10 = product.prices.levels.find((l) => l.level === 10);
  return level10?.amount ?? 0;
}

// b2c indirim oranı pozitifse indirimli fiyat hesaplar, değilse null
function resolveDiscountedPrice(basePrice: number, discountRate: number): number | null {
  if (discountRate <= 0 || basePrice <= 0) return null;
  return Math.round(basePrice * (1 - discountRate / 100) * 100) / 100;
}

export async function syncProductsFromErp(): Promise<{ synced: number; errors: string[] }> {
  const client = getDiaErpClient();
  const errors: string[] = [];
  let synced = 0;

  const syncLog = await prisma.erpSyncLog.create({
    data: { syncType: "PRODUCTS", status: "RUNNING" },
  });

  try {
    let offset = 0;
    const limit = 100;

    while (true) {
      const result = await client.getProducts(limit, offset);

      for (const product of result.data) {
        try {
          const isActive = product.status === "active" && product.b2c.visible;
          const erpVariantCode = resolveErpVariantCode(product);
          const basePrice = resolvePrice(product);
          const discountedPrice = resolveDiscountedPrice(basePrice, product.b2c.discount_rate);

          // ERP integer key'leri — sipariş oluştururken _key_kalemturu ve _key_scf_kalem_birimleri için gerekli
          const erpVariantKey = product.id;                     // raw._key (string olarak saklanır)
          const erpUnitKey = product.units[0]?.key ?? "";       // birincil birimin _key'i
          const erpKdvRate = product.prices.vat_rate ?? 20;

          const savedProduct = await prisma.product.upsert({
            where: { erpProductCode: product.code },
            create: {
              name: product.title || product.name,
              slug: await generateUniqueSlug(product.name),
              shortDescription: product.description || null,
              description: product.note || null,
              images: product.image_url ? [product.image_url] : [],
              erpProductCode: product.code,
              isActive,
              isNew: product.b2c.is_new,
            },
            update: {
              name: product.title || product.name,
              shortDescription: product.description || null,
              description: product.note || null,
              images: product.image_url ? [product.image_url] : [],
              isActive,
              isNew: product.b2c.is_new,
            },
            select: { id: true },
          });

          // Her zaman tek varyant: upsert + diğerlerini sil
          const variant = await prisma.productVariant.upsert({
            where: { erpVariantCode },
            create: {
              productId: savedProduct.id,
              size: 0,
              packagingType: "GLASS",
              price: basePrice,
              discountedPrice,
              stock: 0,
              erpVariantCode,
              erpVariantKey,
              erpUnitKey,
              erpKdvRate,
              isActive,
            },
            update: {
              price: basePrice,
              discountedPrice,
              isActive,
              erpVariantKey,
              erpUnitKey,
              erpKdvRate,
            },
            select: { id: true },
          });

          await prisma.productVariant.deleteMany({
            where: { productId: savedProduct.id, id: { not: variant.id } },
          });

          synced++;
        } catch (err) {
          errors.push(
            `Ürün ${product.code}: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
          );
        }
      }

      if (result.pagination.count < limit) break;
      offset += limit;
    }

    await prisma.erpSyncLog.update({
      where: { id: syncLog.id },
      data: { status: "SUCCESS", recordCount: synced, completedAt: new Date() },
    });
  } catch (err) {
    await prisma.erpSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "FAILED",
        message: err instanceof Error ? err.message : "Bilinmeyen hata",
        completedAt: new Date(),
      },
    });
    throw err;
  }

  return { synced, errors };
}

interface ErpDepoRecord {
  stokkartkodu: string;
  [key: string]: string;
}

interface ErpDepoResult {
  code: string;
  result?: ErpDepoRecord[];
  total_count?: number;
  total?: number;
}

// Depo bazında stok sorgular, yalnızca stok alanını günceller
export async function syncStockFromErp(): Promise<{ updated: number }> {
  const client = getDiaErpClient();
  const depoKodu = process.env.DIA_PROXY_STOCK_DEPO_KODU ?? "41908";
  const firmaKodu = parseInt(process.env.DIA_PROXY_FIRMA_KODU ?? "1");
  const stockField = `fiili_stok$${depoKodu}`;

  let updated = 0;
  let offset = 0;
  const limit = 200;

  while (true) {
    const erpResult = await client.erpCall<ErpDepoResult>(
      "scf_stok_depobazinda_listele",
      {
        firma_kodu: firmaKodu,
        donem_kodu: 0,
        sorts: [{ field: "stokkartkodu", sorttype: "ASC" }],
        params: { tarih: "2099-12-31" },
        limit,
        offset,
      }
    );

    const records = erpResult?.result ?? [];

    for (const record of records) {
      const erpVariantCode = record.stokkartkodu;
      const stock = Math.max(0, Math.floor(parseFloat(record[stockField] ?? "0")));

      const { count } = await prisma.productVariant.updateMany({
        where: { erpVariantCode },
        data: { stock },
      });

      updated += count;
    }

    if (records.length < limit) break;
    offset += limit;
  }

  return { updated };
}

export async function pushOrderToErp(orderId: string): Promise<string> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      items: { include: { variant: true } },
      user: { select: { id: true, email: true, erpCariAdresKey: true } },
    },
  });

  const addr = order.shippingAddress as {
    firstName: string;
    lastName: string;
    email?: string;
    city: string;
    district: string;
    fullAddress: string;
    phone: string;
  };

  const customerEmail = order.user?.email ?? addr.email ?? "";
  const customerCode = buildCustomerCode(order.user?.id ?? null, customerEmail);
  const fullName = `${addr.firstName} ${addr.lastName}`.trim();

  const lines = order.items.map((item) => ({
    variantCode: item.variant.erpVariantCode ?? item.variantId,
    variantKey: parseInt(item.variant.erpVariantKey ?? "0") || 0,
    unitKey: parseInt(item.variant.erpUnitKey ?? "0") || 0,
    quantity: item.quantity,
    unitPrice: parseFloat(item.price.toString()),
    kdvRate: item.variant.erpKdvRate ?? 20,
  }));

  const payload: ProxyOrderRequest = {
    customer: {
      code: customerCode,
      name: fullName,
      email: customerEmail,
      phone: addr.phone,
      city: addr.city,
      district: addr.district,
      address: addr.fullAddress,
      // Kayıtlı üyenin daha önceki siparişten saklanan ERP cari adres key'i
      erpCariAdresKey: order.user?.erpCariAdresKey
        ? parseInt(order.user.erpCariAdresKey)
        : undefined,
    },
    order: {
      erpOrderCode: order.orderNumber,
      lines,
      shippingAddress: {
        name: fullName,
        city: addr.city,
        district: addr.district,
        address: addr.fullAddress,
        phone: addr.phone,
      },
      totalAmount: parseFloat(order.total.toString()),
      shippingFee: parseFloat(order.shippingFee.toString()),
      discount: parseFloat(order.discount.toString()),
      notes: order.notes ?? "",
    },
  };

  const client = getDiaErpClient();
  const result = await client.pushOrder(payload);

  // ERP'nin atadığı fiş numarasını (ör. "E2TC001858") kaydet
  const erpOrderCode = result?.erpOrderCode ?? order.orderNumber;

  await prisma.order.update({
    where: { id: orderId },
    data: { erpOrderCode },
  });

  // Kayıtlı üye için ERP cari adres key'ini sakla (tekrar siparişlerde kullanılır)
  if (result?.erpCariAdresKey && order.user?.id && !order.user.erpCariAdresKey) {
    await prisma.user
      .update({
        where: { id: order.user.id },
        data: { erpCariAdresKey: String(result.erpCariAdresKey) },
      })
      .catch((err) => console.error("[pushOrderToErp] erpCariAdresKey kaydedilemedi:", err));
  }

  return erpOrderCode;
}

/**
 * Deterministik ERP cari kodu üretir.
 * Format: {prefix}{6 rakamlı hash} — örn. "B2C003805"
 * Prefix, DIA_PROXY_CARI_CODE_PREFIX env değişkeninden okunur (varsayılan: "B2C").
 * Kayıtlı üye için userId, misafir için email kullanılır.
 */
function buildCustomerCode(userId: string | null, email: string): string {
  const prefix = process.env.DIA_PROXY_CARI_CODE_PREFIX ?? "B2C";
  const input = userId ?? email;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  const num = String(Math.abs(hash) % 1_000_000).padStart(6, "0");
  return `${prefix}${num}`;
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = createSlug(name);
  let slug = base;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }

  return slug;
}

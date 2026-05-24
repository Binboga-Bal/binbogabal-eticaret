import { prisma } from "@/lib/prisma";
import { getDiaErpClient } from "./client";
import { createSlug } from "@/lib/utils/slug";
import type { DiaOrder, ProxyProduct } from "./types";

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

          const savedProduct = await prisma.product.upsert({
            where: { erpProductCode: product.code },
            create: {
              name: product.title || product.name,
              slug: await generateUniqueSlug(product.name),
              description: product.description || null,
              images: product.image_url ? [product.image_url] : [],
              erpProductCode: product.code,
              isActive,
              isNew: product.b2c.is_new,
            },
            update: {
              name: product.title || product.name,
              description: product.description || null,
              images: product.image_url ? [product.image_url] : [],
              isActive,
              isNew: product.b2c.is_new,
            },
            select: { id: true },
          });

          // Doğru erpVariantCode'lu varyantı bul
          let canonicalId: string;
          const correctVariant = await prisma.productVariant.findUnique({
            where: { erpVariantCode },
            select: { id: true },
          });

          if (correctVariant) {
            canonicalId = correctVariant.id;
            await prisma.productVariant.update({
              where: { id: canonicalId },
              data: { price: basePrice, discountedPrice, isActive },
            });
          } else {
            // Yanlış/eksik erpVariantCode ile oluşturulmuş eski varyant varsa migrate et
            const staleVariant = await prisma.productVariant.findFirst({
              where: { productId: savedProduct.id },
              orderBy: { createdAt: "asc" },
              select: { id: true },
            });

            if (staleVariant) {
              canonicalId = staleVariant.id;
              await prisma.productVariant.update({
                where: { id: canonicalId },
                data: { erpVariantCode, price: basePrice, discountedPrice, isActive },
              });
            } else {
              const created = await prisma.productVariant.create({
                data: {
                  productId: savedProduct.id,
                  size: 0,
                  packagingType: "GLASS",
                  price: basePrice,
                  discountedPrice,
                  stock: 0,
                  erpVariantCode,
                  isActive,
                },
                select: { id: true },
              });
              canonicalId = created.id;
            }
          }

          // Aynı ürüne ait fazladan ERP varyantlarını temizle (erpVariantCode'u olan duplikalar)
          await prisma.productVariant.deleteMany({
            where: {
              productId: savedProduct.id,
              id: { not: canonicalId },
              erpVariantCode: { not: null },
            },
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
  const orderAction = process.env.DIA_PROXY_ORDER_ACTION;
  if (!orderAction) {
    throw new Error("DIA_PROXY_ORDER_ACTION env değişkeni tanımlanmamış");
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { variant: true } } },
  });

  const shippingAddress = order.shippingAddress as {
    firstName: string;
    lastName: string;
    city: string;
    district: string;
    fullAddress: string;
    phone: string;
  };

  const payload: DiaOrder = {
    erpOrderCode: order.orderNumber,
    lines: order.items.map((item) => ({
      variantCode: item.variant.erpVariantCode ?? item.variantId,
      quantity: item.quantity,
      unitPrice: parseFloat(item.price.toString()),
    })),
    shippingAddress: {
      name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      city: shippingAddress.city,
      district: shippingAddress.district,
      address: shippingAddress.fullAddress,
      phone: shippingAddress.phone,
    },
    totalAmount: parseFloat(order.total.toString()),
  };

  const client = getDiaErpClient();
  const result = await client.erpCall<{ erpOrderCode?: string }>(orderAction, {
    order: payload,
  });

  const erpOrderCode = result?.erpOrderCode ?? order.orderNumber;

  await prisma.order.update({
    where: { id: orderId },
    data: { erpOrderCode },
  });

  return erpOrderCode;
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

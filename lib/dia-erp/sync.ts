import { prisma } from "@/lib/prisma";
import { getDiaErpClient } from "./client";
import { createSlug } from "@/lib/utils/slug";
import type { PackagingType } from "@prisma/client";

export async function syncProductsFromErp(): Promise<{ synced: number; errors: string[] }> {
  const client = getDiaErpClient();
  const errors: string[] = [];
  let synced = 0;

  const syncLog = await prisma.erpSyncLog.create({
    data: { syncType: "PRODUCTS", status: "RUNNING" },
  });

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await client.getProducts(page, 100);
      if (!result.success || !result.data) {
        errors.push(result.error ?? "Ürünler alınamadı");
        break;
      }

      for (const erpProduct of result.data) {
        try {
          await prisma.product.upsert({
            where: { erpProductCode: erpProduct.code },
            create: {
              name: erpProduct.name,
              slug: await generateUniqueSlug(erpProduct.name),
              description: erpProduct.description,
              images: JSON.stringify([]),
              erpProductCode: erpProduct.code,
              isActive: erpProduct.isActive,
            },
            update: {
              name: erpProduct.name,
              description: erpProduct.description,
              isActive: erpProduct.isActive,
            },
          });
          synced++;
        } catch (err) {
          errors.push(
            `Ürün ${erpProduct.code}: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
          );
        }
      }

      hasMore = result.data.length === 100;
      page++;
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

export async function syncStockFromErp(): Promise<{ updated: number }> {
  const client = getDiaErpClient();
  const result = await client.getStockLevels();

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Stok alınamadı");
  }

  let updated = 0;
  for (const stock of result.data) {
    const variant = await prisma.productVariant.findFirst({
      where: { erpVariantCode: stock.variantCode },
    });

    if (variant) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock: stock.stock },
      });
      updated++;
    }
  }

  return { updated };
}

export async function pushOrderToErp(orderId: string): Promise<string> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      items: { include: { variant: true } },
    },
  });

  const shippingAddress = order.shippingAddress as {
    firstName: string;
    lastName: string;
    city: string;
    district: string;
    fullAddress: string;
    phone: string;
  };

  const client = getDiaErpClient();
  const result = await client.createOrder({
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
  });

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "ERP sipariş oluşturulamadı");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { erpOrderCode: result.data.erpOrderCode },
  });

  return result.data.erpOrderCode;
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

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentAdapter } from "@/lib/payment";
import { generateOrderNumber } from "@/lib/utils/format";
import { z } from "zod";

const orderSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    city: z.string(),
    district: z.string(),
    fullAddress: z.string(),
  }),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      productName: z.string(),
      variantInfo: z.string(),
    }),
  ),
  subtotal: z.number().positive(),
  shippingFee: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().positive(),
  couponCode: z.string().nullable().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["QNB_PAY", "CASH_ON_DELIVERY"]).default("QNB_PAY"),
  // 🔒 PCI-DSS GÜVENLİĞİ: 'card' şemasını buradan tamamen siliyoruz veya opsiyonel bırakıp kodda hiç kullanmıyoruz.
  // Frontend artık kart verisi göndermediği için bu alan API'ye hiç gelmeyecek.
});

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz sipariş verisi" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const orderNumber = generateOrderNumber();

  // 1. ADIM: Siparişi 'ÖDEME_BEKLIYOR' mantığıyla DB'ye kaydet
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id,
      guestEmail: session ? undefined : data.shippingAddress.email,
      guestPhone: session ? undefined : data.shippingAddress.phone,
      shippingAddress: data.shippingAddress,
      subtotal: data.subtotal,
      shippingFee: data.shippingFee,
      discount: data.discount,
      total: data.total,
      couponCode: data.couponCode ?? null,
      notes: data.notes,
      items: {
        create: data.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          variantInfo: item.variantInfo,
        })),
      },
    },
  });

  // Kupon kullanımını artır
  if (data.couponCode) {
    await prisma.coupon
      .update({
        where: { code: data.couponCode },
        data: { usedCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // ----------------------------------------------------------------
  // SENARYO A: KAPIDA ÖDEME
  // ----------------------------------------------------------------
  if (data.paymentMethod === "CASH_ON_DELIVERY") {
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: "CASH_ON_DELIVERY",
        amount: data.total,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      redirectUrl: `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(order.orderNumber)}&yontem=kapida`,
      orderId: order.id,
    });
  }

  // ----------------------------------------------------------------
  // SENARYO B: QNB PAY — paySmart3D (browser-to-bank, PCI-DSS uyumlu)
  // Sunucu: token alır + hash_key üretir → formPayload döner
  // Browser: kart verisiyle birlikte doğrudan QNBPay'e POST eder
  // ----------------------------------------------------------------
  const adapter = getPaymentAdapter("QNB_PAY");

  const forwardedFor = req.headers.get("x-forwarded-for");
  const rawIp = forwardedFor?.split(",")[0]?.trim() ?? "";
  // QNBPay sadece IPv4 kabul ediyor — localhost veya IPv6 gelirse gerçek IP ile fallback
  const ip =
    /^\d{1,3}(\.\d{1,3}){3}$/.test(rawIp) && !rawIp.startsWith("127.")
      ? rawIp
      : "188.119.7.199";

  const paymentResult = await adapter.createPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: data.total,
    customer: {
      name: data.shippingAddress.firstName,
      surname: data.shippingAddress.lastName,
      email: data.shippingAddress.email,
      phone: data.shippingAddress.phone,
      ip,
    },
    shippingAddress: {
      firstName: data.shippingAddress.firstName,
      lastName: data.shippingAddress.lastName,
      city: data.shippingAddress.city,
      district: data.shippingAddress.district,
      fullAddress: data.shippingAddress.fullAddress,
    },
    items: data.items.map((item) => ({
      id: item.variantId,
      name: item.productName,
      category: "Bal",
      price: item.price,
      quantity: item.quantity,
    })),
    callbackUrl: `${baseUrl}/api/payment/qnb/callback`,
    cancelUrl: `${baseUrl}/odeme/hata`,
    // 🔒 Kart verisi parametresini buradan tamamen sildik. Sadece sipariş verileri gidiyor.
  });

  // İşlemi Transaction tablosuna kaydet
  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: "QNB_PAY",
      amount: data.total,
      status: paymentResult.success ? "PENDING" : "FAILED",
      errorMessage: paymentResult.error,
    },
  });

  if (!paymentResult.success) {
    return NextResponse.json(
      { error: paymentResult.error ?? "Ödeme hazırlanamadı" },
      { status: 500 },
    );
  }

  // 🔒 PCI-DSS: Kart verisi yoktur. Frontend bu alanlarla + kart bilgileriyle
  // doğrudan QNBPay endpoint'ine form POST yapar — sunucumuz asla kart görmez.
  return NextResponse.json({
    orderId: order.id,
    formPayload: paymentResult.formPayload,
  });
}

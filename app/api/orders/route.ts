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
    })
  ),
  subtotal: z.number().positive(),
  shippingFee: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().positive(),
  couponCode: z.string().nullable().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["QNB_PAY", "CASH_ON_DELIVERY"]).default("QNB_PAY"),
  card: z
    .object({
      holderName: z.string(),
      number: z.string(),
      expiryMonth: z.string(),
      expiryYear: z.string(),
      cvv: z.string(),
      installments: z.number().int().min(1).default(1),
    })
    .optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz sipariş verisi" }, { status: 400 });
  }

  const data = parsed.data;
  const orderNumber = generateOrderNumber();

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

  // Kapıda ödeme: doğrudan başarı sayfasına yönlendir
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

  // Online ödeme: QNBPay Güvenli Ödeme Sayfası (kart verisi bizden geçmez)
  const adapter = getPaymentAdapter("QNB_PAY");

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "127.0.0.1";

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
    card: data.card,
  });

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: "QNB_PAY",
      amount: data.total,
      status: paymentResult.success ? "PENDING" : "FAILED",
      providerRefId: paymentResult.transactionId,
      errorMessage: paymentResult.error,
    },
  });

  if (!paymentResult.success) {
    return NextResponse.json(
      { error: paymentResult.error ?? "Ödeme başlatılamadı" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    redirectUrl: paymentResult.redirectUrl,
    htmlContent: paymentResult.htmlContent,
    orderId: order.id,
  });
}

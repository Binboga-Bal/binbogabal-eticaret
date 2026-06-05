import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentAdapter } from "@/lib/payment";
import { generateOrderNumber } from "@/lib/utils/format";
import { sendOrderConfirmedEmail } from "@/lib/mail/mail.service";
import { z } from "zod";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

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
  appliedCampaignIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["QNB_PAY", "CASH_ON_DELIVERY"]).default("QNB_PAY"),
});

export async function POST(req: Request) {
  const startTime = Date.now();
  const actorIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? undefined;
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // ----------------------------------------------------------------
  // SENARYO A: KAPIDA ÖDEME — sipariş anında oluşturulur
  // ----------------------------------------------------------------
  if (data.paymentMethod === "CASH_ON_DELIVERY") {
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

    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: "CASH_ON_DELIVERY",
        amount: data.total,
        status: "PENDING",
      },
    });

    // Kupon kullanımını artır
    if (data.couponCode) {
      await prisma.coupon
        .update({ where: { code: data.couponCode }, data: { usedCount: { increment: 1 } } })
        .catch(() => {});
    }

    // Kampanya kullanımlarını kaydet
    if (data.appliedCampaignIds && data.appliedCampaignIds.length > 0) {
      const discountPerCampaign = data.discount / data.appliedCampaignIds.length;
      await Promise.all(
        data.appliedCampaignIds.map((campaignId) =>
          Promise.all([
            prisma.campaignUsage.create({
              data: { campaignId, customerId: session?.user?.id ?? null, orderId: order.id, discountAmount: discountPerCampaign },
            }).catch(() => {}),
            prisma.campaign.update({
              where: { id: campaignId },
              data: { budgetUsed: { increment: discountPerCampaign } },
            }).catch(() => {}),
          ])
        )
      );
    }

    // Onay maili
    const toEmail = session?.user?.email ?? data.shippingAddress.email;
    const toName  = session?.user?.name  ?? data.shippingAddress.firstName;
    await sendOrderConfirmedEmail(
      session?.user?.id ?? "",
      toEmail,
      toName,
      order.orderNumber,
      order.id,
      data.items.map((i) => ({ productName: i.productName, variantInfo: i.variantInfo, quantity: i.quantity, price: i.price })),
      data.total,
    ).catch((err) => console.error("[orders] kapida mail hata:", err));

    await createLog({
      level: "INFO",
      category: "ORDER",
      action: LOG_ACTIONS.ORDER_CREATED,
      message: `Sipariş oluşturuldu (kapıda ödeme): #${order.orderNumber}`,
      actorId: session?.user?.id,
      actorRole: session?.user?.role ?? "CUSTOMER",
      actorEmail: toEmail,
      actorIp,
      targetType: "Order",
      targetId: order.id,
      targetLabel: `Sipariş #${order.orderNumber}`,
      detail: {
        orderNumber: order.orderNumber,
        paymentMethod: "CASH_ON_DELIVERY",
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        discount: data.discount,
        total: data.total,
        itemCount: data.items.length,
        couponCode: data.couponCode ?? null,
        isGuest: !session?.user?.id,
        city: data.shippingAddress.city,
        duration: Date.now() - startTime,
      },
      method: "POST",
      path: "/api/orders",
      statusCode: 200,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({
      redirectUrl: `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(order.orderNumber)}&yontem=kapida`,
      orderId: order.id,
    });
  }

  // ----------------------------------------------------------------
  // SENARYO B: QNB PAY — sipariş ÖDEME ONAYLANINCA oluşturulur
  // Burada yalnızca geçici CheckoutSession kaydedilir.
  // Gerçek Order; callback başarı yolunda yaratılır.
  // ----------------------------------------------------------------
  const orderNumber = generateOrderNumber();

  // Geçici oturum — 30 dk geçerli
  await prisma.checkoutSession.create({
    data: {
      id: orderNumber,        // aynı zamanda QNBPay invoice_id
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      userId: session?.user?.id ?? null,
      shippingAddress: data.shippingAddress,
      items: data.items,
      subtotal: data.subtotal,
      shippingFee: data.shippingFee,
      discount: data.discount,
      total: data.total,
      couponCode: data.couponCode ?? null,
      appliedCampaignIds: data.appliedCampaignIds ?? [],
      notes: data.notes ?? null,
    },
  });

  const adapter = getPaymentAdapter("QNB_PAY");

  const forwardedFor = req.headers.get("x-forwarded-for");
  const rawIp = forwardedFor?.split(",")[0]?.trim() ?? "";
  const ip =
    /^\d{1,3}(\.\d{1,3}){3}$/.test(rawIp) && !rawIp.startsWith("127.")
      ? rawIp
      : "188.119.7.199";

  const paymentResult = await adapter.createPayment({
    orderId: orderNumber,
    orderNumber,
    amount: data.total,
    shippingFee: data.shippingFee,
    discount: data.discount,
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
    cancelUrl: `${baseUrl}/api/payment/qnb/cancel`,
  });

  if (!paymentResult.success) {
    // QNBPay form oluşturulamadıysa session'ı temizle
    await prisma.checkoutSession.deleteMany({ where: { id: orderNumber } }).catch(() => {});

    await createLog({
      level: "ERROR",
      category: "PAYMENT",
      action: LOG_ACTIONS.PAYMENT_FAILED,
      message: `QNB ödeme başlatılamadı: ${paymentResult.error}`,
      actorId: session?.user?.id,
      actorEmail: session?.user?.email ?? data.shippingAddress.email,
      actorIp,
      detail: {
        provider: "QNB_PAY",
        stage: "payment_init",
        orderNumber,
        amount: data.total,
        errorMessage: paymentResult.error ?? null,
        duration: Date.now() - startTime,
      },
      method: "POST",
      path: "/api/orders",
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: paymentResult.error ?? "Ödeme hazırlanamadı" },
      { status: 500 },
    );
  }

  // formPayload frontend'e dönüyor; browser kart verisiyle QNBPay'e POST eder
  return NextResponse.json({ formPayload: paymentResult.formPayload });
}

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { QNBPayAdapter } from "@/lib/payment";
import { pushOrderToErp } from "@/lib/dia-erp/sync";
import { sendOrderConfirmedEmail } from "@/lib/mail/mail.service";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// QNB params'tan kart/hash verisi dışında her şeyi loglar
function safeQnbParams(params: Record<string, string>) {
  const strip = new Set(["hash_key", "cc_no", "cvv", "expiry_month", "expiry_year", "cc_holder_name"]);
  return Object.fromEntries(Object.entries(params).filter(([k]) => !strip.has(k)));
}

// Ödeme başarısız olduğunda geçici checkout session'ı siler.
async function deleteCheckoutSession(sessionId: string) {
  try {
    await prisma.checkoutSession.deleteMany({ where: { id: sessionId } });
  } catch (err) {
    console.error("[deleteCheckoutSession] hata:", sessionId, err);
  }
}

// Başarılı ödemede CheckoutSession'dan gerçek Order oluşturur.
// Idempotency: session yoksa (callback 2x geldiyse) Order'ı döndürür.
async function createOrderFromSession(sessionId: string, transactionId?: string, providerResponse?: Record<string, string>) {
  // Önce idempotency kontrolü — Order zaten oluşturulmuş mu?
  const existing = await prisma.order.findUnique({ where: { orderNumber: sessionId } });
  if (existing) return existing;

  const session = await prisma.checkoutSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  const items = session.items as Array<{
    variantId: string;
    quantity: number;
    price: number;
    productName: string;
    variantInfo: string;
    imageUrl?: string;
  }>;

  const shippingAddress = session.shippingAddress as Record<string, string>;
  const appliedCampaignIds = (session.appliedCampaignIds as string[]) ?? [];

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: session.id,
        userId: session.userId ?? undefined,
        guestEmail: session.userId ? undefined : shippingAddress.email,
        guestPhone: session.userId ? undefined : shippingAddress.phone,
        shippingAddress: session.shippingAddress as Prisma.InputJsonValue,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        subtotal: session.subtotal,
        shippingFee: session.shippingFee,
        discount: session.discount,
        total: session.total,
        couponCode: session.couponCode ?? null,
        notes: session.notes ?? null,
        items: {
          create: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
            variantInfo: item.variantInfo,
            image: item.imageUrl,
          })),
        },
      },
    });

    await tx.paymentTransaction.create({
      data: {
        orderId: newOrder.id,
        provider: "QNB_PAY",
        status: "SUCCESS",
        amount: session.total,
        providerRefId: transactionId ?? undefined,
        providerResponse: providerResponse as Prisma.InputJsonValue | undefined,
      },
    });

    await tx.checkoutSession.delete({ where: { id: sessionId } });

    return newOrder;
  });

  // Kupon kullanımını artır
  if (session.couponCode) {
    await prisma.coupon
      .update({ where: { code: session.couponCode }, data: { usedCount: { increment: 1 } } })
      .catch(() => {});
  }

  // Kampanya kullanımlarını kaydet
  if (appliedCampaignIds.length > 0) {
    const discountPerCampaign = Number(session.discount) / appliedCampaignIds.length;
    await Promise.all(
      appliedCampaignIds.map((campaignId) =>
        Promise.all([
          prisma.campaignUsage.create({
            data: { campaignId, customerId: session.userId ?? null, orderId: order.id, discountAmount: discountPerCampaign },
          }).catch(() => {}),
          prisma.campaign.update({
            where: { id: campaignId },
            data: { budgetUsed: { increment: discountPerCampaign } },
          }).catch(() => {}),
        ])
      )
    );
  }

  return order;
}

// Hem GET hem POST callback aynı mantıkla işlenir.
async function handleCallback(params: Record<string, string>, req: Request) {
  if (!params.invoice_id && !params.order_no) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const startTime = Date.now();
  const actorIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const adapter = new QNBPayAdapter();
  const result = await adapter.verifyPayment(params);

  if (!result.success || !result.orderId) {
    console.error("QNBPay callback doğrulama başarısız:", result.error, safeQnbParams(params));

    const failedSessionId = params.invoice_id ?? params.order_no;
    if (failedSessionId) await deleteCheckoutSession(failedSessionId);

    await createLog({
      level: "ERROR",
      category: "PAYMENT",
      action: LOG_ACTIONS.PAYMENT_FAILED,
      message: `QNB ödeme başarısız: ${result.error ?? "bilinmeyen hata"}`,
      actorIp,
      detail: {
        provider: "QNB_PAY",
        stage: "callback_verify",
        orderNumber: failedSessionId ?? null,
        errorMessage: result.error ?? null,
        qnbParams: safeQnbParams(params),
        callbackMethod: req.method,
        duration: Date.now() - startTime,
      },
      method: req.method,
      path: "/api/payment/qnb/callback",
      statusCode: 303,
    });

    return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
  }

  const sessionId = result.orderId;

  // QNBpay'den ödeme durumunu teyit et
  const statusResult = await adapter.checkStatus(sessionId);
  if (!statusResult.success) {
    const callbackConfirmsSuccess =
      (params.payment_status === "1" || params.qnbpay_status === "1") &&
      (params.error_code === "100" || params.status_code === "100");

    if (callbackConfirmsSuccess && statusResult.paymentStatus === undefined) {
      console.warn(
        "[QNBPay] checkstatus parse edilemedi, callback payment_status=1 → devam ediliyor",
        { invoiceId: sessionId, checkstatusError: statusResult.error },
      );
    } else {
      await deleteCheckoutSession(sessionId);

      await createLog({
        level: "ERROR",
        category: "PAYMENT",
        action: LOG_ACTIONS.PAYMENT_FAILED,
        message: `QNB checkstatus başarısız: ${statusResult.error ?? "bilinmeyen hata"}`,
        actorIp,
        detail: {
          provider: "QNB_PAY",
          stage: "checkstatus",
          orderNumber: sessionId,
          errorMessage: statusResult.error ?? null,
          paymentStatus: statusResult.paymentStatus ?? null,
          qnbParams: safeQnbParams(params),
          callbackMethod: req.method,
          duration: Date.now() - startTime,
        },
        method: req.method,
        path: "/api/payment/qnb/callback",
        statusCode: 303,
      });

      return NextResponse.redirect(
        `${baseUrl}/odeme/hata?invoice_id=${encodeURIComponent(sessionId)}`,
        { status: 303 },
      );
    }
  }

  // Ödeme başarılı — CheckoutSession'dan gerçek siparişi oluştur
  const order = await createOrderFromSession(sessionId, result.transactionId, safeQnbParams(params));

  if (!order) {
    console.error("CheckoutSession bulunamadı ve Order da yok:", sessionId);
    await createLog({
      level: "ERROR",
      category: "PAYMENT",
      action: LOG_ACTIONS.PAYMENT_FAILED,
      message: `QNB callback: session/sipariş bulunamadı #${sessionId}`,
      actorIp,
      detail: { provider: "QNB_PAY", stage: "order_create", orderNumber: sessionId, qnbParams: safeQnbParams(params) },
      method: req.method,
      path: "/api/payment/qnb/callback",
      statusCode: 303,
    });
    return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
  }

  // ERP push
  pushOrderToErp(order.id).catch((err) =>
    console.error("ERP push başarısız, sipariş:", order.id, err),
  );

  // Onay maili
  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: true, user: { select: { id: true, email: true, name: true } } },
  });

  if (fullOrder) {
    const shippingAddress = fullOrder.shippingAddress as Record<string, string>;
    const toEmail = fullOrder.user?.email ?? shippingAddress.email;
    const toName  = fullOrder.user?.name  ?? shippingAddress.firstName ?? "Müşterimiz";

    await sendOrderConfirmedEmail(
      fullOrder.user?.id ?? "",
      toEmail,
      toName,
      fullOrder.orderNumber,
      fullOrder.id,
      fullOrder.items.map((i) => ({
        productName: i.productName,
        variantInfo: i.variantInfo,
        quantity: i.quantity,
        price: Number(i.price),
        imageUrl: i.image ?? undefined,
      })),
      Number(fullOrder.total),
    ).catch((err) => console.error("[qnb-callback] mail hata:", err));
  }

  await createLog({
    level: "INFO",
    category: "PAYMENT",
    action: LOG_ACTIONS.PAYMENT_SUCCESS,
    message: `Ödeme başarılı: Sipariş #${order.orderNumber}`,
    actorId: fullOrder?.user?.id,
    actorEmail: fullOrder?.user?.email,
    actorIp,
    targetType: "Order",
    targetId: order.id,
    targetLabel: `Sipariş #${order.orderNumber}`,
    detail: {
      provider: "QNB_PAY",
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      transactionId: result.transactionId ?? null,
      itemCount: fullOrder?.items.length ?? 0,
      isGuest: !fullOrder?.user,
      qnbParams: safeQnbParams(params),
      callbackMethod: req.method,
      duration: Date.now() - startTime,
    },
    method: req.method,
    path: "/api/payment/qnb/callback",
    statusCode: 200,
    duration: Date.now() - startTime,
  });

  return NextResponse.redirect(
    `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(order.orderNumber)}`,
    { status: 303 },
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => { params[key] = value; });
  return handleCallback(params, req);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => { params[key] = value.toString(); });
  return handleCallback(params, req);
}

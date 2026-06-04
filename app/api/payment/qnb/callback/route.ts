import { NextResponse } from "next/server";
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

// Hem GET hem POST callback aynı mantıkla işlenir.
// QNBPay response_method:"GET" ile return_url'i GET query param ile çağırır,
// bazı entegrasyonlar POST ile çağırabilir — ikisi de desteklenir.
async function handleCallback(params: Record<string, string>, req: Request) {
  const startTime = Date.now();
  const actorIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const adapter = new QNBPayAdapter();
  const result = await adapter.verifyPayment(params);

  if (!result.success || !result.orderId) {
    console.error("QNBPay callback doğrulama başarısız:", result.error, safeQnbParams(params));

    await createLog({
      level: "ERROR",
      category: "PAYMENT",
      action: LOG_ACTIONS.PAYMENT_FAILED,
      message: `QNB ödeme başarısız: ${result.error ?? "bilinmeyen hata"}`,
      actorIp,
      detail: {
        provider: "QNB_PAY",
        stage: "callback_verify",
        orderNumber: params.invoice_id ?? null,
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

  const orderNumber = result.orderId;

  // QNBpay'den ödeme durumunu teyit et — query string'e güvenmek yeterli değil
  const statusResult = await adapter.checkStatus(orderNumber);
  if (!statusResult.success) {
    await createLog({
      level: "ERROR",
      category: "PAYMENT",
      action: LOG_ACTIONS.PAYMENT_FAILED,
      message: `QNB checkstatus başarısız: ${statusResult.error ?? "bilinmeyen hata"}`,
      actorIp,
      detail: {
        provider: "QNB_PAY",
        stage: "checkstatus",
        orderNumber,
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
      `${baseUrl}/odeme/hata?invoice_id=${encodeURIComponent(orderNumber)}`,
      { status: 303 },
    );
  }
  const order = await prisma.order.findUnique({ where: { orderNumber } });

  if (!order) {
    console.error("Sipariş bulunamadı:", orderNumber);
    await createLog({
      level: "ERROR",
      category: "PAYMENT",
      action: LOG_ACTIONS.PAYMENT_FAILED,
      message: `QNB callback: sipariş bulunamadı #${orderNumber}`,
      actorIp,
      detail: {
        provider: "QNB_PAY",
        stage: "order_lookup",
        orderNumber,
        qnbParams: safeQnbParams(params),
      },
      method: req.method,
      path: "/api/payment/qnb/callback",
      statusCode: 303,
    });
    return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
  }

  // Idempotency — zaten ödenmişse direkt başarı sayfasına
  if (order.paymentStatus === "PAID") {
    return NextResponse.redirect(
      `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(orderNumber)}`,
      { status: 303 },
    );
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    }),
    prisma.paymentTransaction.updateMany({
      where: { orderId: order.id, status: "PENDING" },
      data: {
        status: "SUCCESS",
        providerRefId: result.transactionId,
        providerResponse: params as Record<string, string>,
      },
    }),
  ]);

  pushOrderToErp(order.id).catch((err) =>
    console.error("ERP push başarısız, sipariş:", order.id, err),
  );

  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: true, user: { select: { id: true, email: true, name: true } } },
  });

  if (fullOrder) {
    const toEmail =
      fullOrder.user?.email ??
      (fullOrder.shippingAddress as Record<string, string>).email;
    const toName =
      fullOrder.user?.name ??
      (fullOrder.shippingAddress as Record<string, string>).firstName ??
      "Müşterimiz";
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
      })),
      Number(fullOrder.total),
    ).catch((err) => console.error("[qnb-callback] mail hata:", err));
  }

  await createLog({
    level: "INFO",
    category: "PAYMENT",
    action: LOG_ACTIONS.PAYMENT_SUCCESS,
    message: `Ödeme başarılı: Sipariş #${orderNumber}`,
    actorId: fullOrder?.user?.id,
    actorEmail: fullOrder?.user?.email,
    actorIp,
    targetType: "Order",
    targetId: order.id,
    targetLabel: `Sipariş #${orderNumber}`,
    detail: {
      provider: "QNB_PAY",
      orderNumber,
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
    `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(orderNumber)}`,
    { status: 303 },
  );
}

// QNBPay response_method:"GET" → return_url'e GET ile gönderir
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // Hiç param yoksa doğrudan cancel_url'den gelmiştir (handleCallback bunu da yakalar)
  return handleCallback(params, req);
}

// Bazı entegrasyonlarda POST ile de gelebilir
export async function POST(req: Request) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });
  return handleCallback(params, req);
}

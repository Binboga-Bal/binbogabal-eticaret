import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QNBPayAdapter } from "@/lib/payment";
import { pushOrderToErp } from "@/lib/dia-erp/sync";
import { sendOrderConfirmedEmail } from "@/lib/mail/mail.service";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// QNBPay 3D ödeme sonrası kullanıcının tarayıcısını yönlendirdiği URL (browser POST)
export async function POST(req: Request) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  const adapter = new QNBPayAdapter();
  const result = await adapter.verifyPayment(params);

  if (!result.success || !result.orderId) {
    console.error("QNBPay callback doğrulama başarısız:", result.error, params);
    void createLog({
      level: "ERROR",
      category: "PAYMENT",
      action: LOG_ACTIONS.PAYMENT_FAILED,
      message: `QNB callback doğrulama başarısız: ${result.error ?? "bilinmeyen hata"}`,
      method: "POST",
      path: "/api/payment/qnb/callback",
      statusCode: 303,
    });
    return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
  }

  const orderNumber = result.orderId;
  const order = await prisma.order.findUnique({ where: { orderNumber } });

  if (!order) {
    console.error("Sipariş bulunamadı:", orderNumber);
    return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
  }

  // Idempotency: zaten işlenmişse başarı sayfasına yönlendir
  if (order.paymentStatus === "PAID") {
    return NextResponse.redirect(
      `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(orderNumber)}`,
      { status: 303 }
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
    console.error("ERP push başarısız, sipariş:", order.id, err)
  );

  // Sipariş onay maili gönder
  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: true, user: { select: { id: true, email: true, name: true } } },
  });
  if (fullOrder) {
    const toEmail = fullOrder.user?.email ?? (fullOrder.shippingAddress as Record<string, string>).email;
    const toName = fullOrder.user?.name ?? (fullOrder.shippingAddress as Record<string, string>).firstName ?? "Müşterimiz";
    const userId = fullOrder.user?.id ?? "";
    await sendOrderConfirmedEmail(
      userId,
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

  void createLog({
    level: "INFO",
    category: "PAYMENT",
    action: LOG_ACTIONS.PAYMENT_SUCCESS,
    message: `Ödeme başarılı: Sipariş #${orderNumber}`,
    actorId: fullOrder?.user?.id,
    actorEmail: fullOrder?.user?.email,
    targetType: "Order",
    targetId: order.id,
    targetLabel: `Sipariş #${orderNumber}`,
    detail: { transactionId: result.transactionId, amount: Number(order.total) },
    method: "POST",
    path: "/api/payment/qnb/callback",
    statusCode: 303,
  });

  return NextResponse.redirect(
    `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(orderNumber)}`,
    { status: 303 }
  );
}

// Kullanıcı cancel_url'den geri dönerse
export async function GET() {
  return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
}

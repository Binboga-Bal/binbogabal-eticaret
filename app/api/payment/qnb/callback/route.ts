import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QNBPayAdapter } from "@/lib/payment";
import { pushOrderToErp } from "@/lib/dia-erp/sync";

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

  return NextResponse.redirect(
    `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(orderNumber)}`,
    { status: 303 }
  );
}

// Kullanıcı cancel_url'den geri dönerse
export async function GET() {
  return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
}

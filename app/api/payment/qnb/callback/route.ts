import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentAdapter } from "@/lib/payment";
import { pushOrderToErp } from "@/lib/dia-erp/sync";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  const adapter = getPaymentAdapter("QNB_PAY");
  const result = await adapter.verifyPayment(params);

  if (!result.success) {
    console.error("QNB Pay callback verification failed:", result.error);
    // QNB Pay/PayTR expects plain text response
    return new NextResponse("FAIL", { status: 200 });
  }

  const orderNumber = result.orderId;
  if (!orderNumber) {
    return new NextResponse("FAIL", { status: 200 });
  }

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) {
    console.error("Order not found:", orderNumber);
    return new NextResponse("FAIL", { status: 200 });
  }

  // Idempotency: already processed
  if (order.paymentStatus === "PAID") {
    return new NextResponse("OK", { status: 200 });
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

  // Push to ERP (non-blocking)
  pushOrderToErp(order.id).catch((err) =>
    console.error("ERP push failed for order:", order.id, err)
  );

  return new NextResponse("OK", { status: 200 });
}

// GET: Browser redirect after payment (some providers redirect here)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("siparis");
  const status = searchParams.get("durum");

  if (status === "basarili" && orderNumber) {
    return NextResponse.redirect(
      `${baseUrl}/odeme/basari?siparis=${encodeURIComponent(orderNumber)}`
    );
  }

  return NextResponse.redirect(`${baseUrl}/odeme/hata`);
}

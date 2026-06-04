import { NextResponse } from "next/server";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Kullanıcı banka 3D sayfasında "İptal" tıkladığında QNBPay buraya yönlendirir.
export async function GET(req: Request) {
  const actorIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const url = new URL(req.url);
  const orderNumber = url.searchParams.get("invoice_id") ?? undefined;

  await createLog({
    level: "WARNING",
    category: "PAYMENT",
    action: LOG_ACTIONS.PAYMENT_FAILED,
    message: `Ödeme iptal edildi${orderNumber ? `: Sipariş #${orderNumber}` : ""}`,
    actorIp,
    targetType: orderNumber ? "Order" : undefined,
    targetLabel: orderNumber ? `Sipariş #${orderNumber}` : undefined,
    detail: {
      provider: "QNB_PAY",
      stage: "user_cancel",
      orderNumber: orderNumber ?? null,
    },
    method: "GET",
    path: "/api/payment/qnb/cancel",
    statusCode: 303,
  });

  return NextResponse.redirect(`${baseUrl}/odeme/hata`, { status: 303 });
}

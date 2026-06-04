import { NextResponse } from "next/server";
import { createLog } from "@/lib/logger";
import { LOG_ACTIONS } from "@/lib/logger/actions";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Kart/hash verisi dışındaki tüm QNBpay parametrelerini tutar
const STRIP_KEYS = new Set([
  "hash_key", "cc_no", "cvv", "expiry_month", "expiry_year", "cc_holder_name",
]);

async function handleCancel(params: Record<string, string>, req: Request) {
  const actorIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const orderNumber =
    params.invoice_id ?? params.order_no ?? undefined;

  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([k]) => !STRIP_KEYS.has(k)),
  );

  await createLog({
    level: "WARNING",
    category: "PAYMENT",
    action: LOG_ACTIONS.PAYMENT_FAILED,
    message: `Ödeme iptal/başarısız${orderNumber ? `: Sipariş #${orderNumber}` : ""}`,
    actorIp,
    targetType: orderNumber ? "Order" : undefined,
    targetLabel: orderNumber ? `Sipariş #${orderNumber}` : undefined,
    detail: {
      provider: "QNB_PAY",
      stage: "cancel_url",
      orderNumber: orderNumber ?? null,
      errorCode: params.error_code ?? params.errorCode ?? null,
      qnbpayStatus: params.qnbpay_status ?? null,
      qnbParams: safeParams,
    },
    method: req.method,
    path: "/api/payment/qnb/cancel",
    statusCode: 303,
  });

  // QNBpay parametrelerini /odeme/hata sayfasına ilet
  const qs = new URLSearchParams(
    Object.entries(safeParams).filter(([, v]) => v !== ""),
  ).toString();

  return NextResponse.redirect(
    qs ? `${baseUrl}/odeme/hata?${qs}` : `${baseUrl}/odeme/hata`,
    { status: 303 },
  );
}

// QNBpay response_method:"GET" → return_url/cancel_url GET query params ile çağırır
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return handleCancel(params, req);
}

// QNBpay response_method:"POST" → cancel_url'e form-data POST atar
export async function POST(req: Request) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });
  return handleCancel(params, req);
}

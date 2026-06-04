import type { PaymentAdapter } from "./types";
import { QNBPayAdapter } from "./qnb-pay";

export type { PaymentAdapter, CreatePaymentParams, PaymentResult, VerifyPaymentResult, Smart3DFormPayload, CheckStatusResult } from "./types";

const adapters: Record<string, () => PaymentAdapter> = {
  QNB_PAY: () => new QNBPayAdapter(),
};

export function getPaymentAdapter(provider: string = "QNB_PAY"): PaymentAdapter {
  const factory = adapters[provider];
  if (!factory) throw new Error(`Bilinmeyen ödeme sağlayıcısı: ${provider}`);
  return factory();
}

export { QNBPayAdapter };

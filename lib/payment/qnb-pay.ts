import crypto from "crypto";
import type {
  PaymentAdapter,
  CreatePaymentParams,
  PaymentResult,
  VerifyPaymentResult,
  RefundResult,
} from "./types";

export class QNBPayAdapter implements PaymentAdapter {
  readonly name = "QNB_PAY";

  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly merchantSalt: string;
  private readonly apiUrl: string;
  private readonly isSandbox: boolean;

  constructor() {
    this.merchantId = process.env.QNB_PAY_MERCHANT_ID!;
    this.merchantKey = process.env.QNB_PAY_MERCHANT_KEY!;
    this.merchantSalt = process.env.QNB_PAY_MERCHANT_SALT!;
    this.apiUrl = process.env.QNB_PAY_API_URL ?? "https://api.qnbpay.com.tr";
    this.isSandbox = process.env.QNB_PAY_SANDBOX === "true";
  }

  private generateHash(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const hashStr = sortedKeys.map((k) => params[k]).join(this.merchantSalt);
    return crypto
      .createHmac("sha256", this.merchantKey)
      .update(hashStr)
      .digest("base64");
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const amountInKurus = Math.round(params.amount * 100).toString();

    const postData = {
      merchant_id: this.merchantId,
      user_ip: params.customer.ip,
      merchant_order_id: params.orderNumber,
      email: params.customer.email,
      payment_amount: amountInKurus,
      currency: params.currency ?? "TL",
      payment_type: "card",
      test_mode: this.isSandbox ? "1" : "0",
      non_3d: "0",
      merchant_ok_url: params.successUrl ?? params.callbackUrl,
      merchant_fail_url: params.cancelUrl,
      user_name: params.customer.name,
      user_phone: params.customer.phone,
      user_address: params.shippingAddress.fullAddress,
      user_basket: JSON.stringify(
        params.items.map((item) => [
          item.name,
          (item.price * item.quantity).toFixed(2),
          item.quantity,
        ])
      ),
    };

    const hash = this.generateHash(
      postData as unknown as Record<string, string>
    );
    const payload = { ...postData, paytr_token: hash };

    try {
      const response = await fetch(`${this.apiUrl}/api/get-token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload as Record<string, string>),
      });

      const data = (await response.json()) as {
        status: string;
        token?: string;
        reason?: string;
      };

      if (data.status !== "success" || !data.token) {
        return { success: false, error: data.reason ?? "Ödeme başlatılamadı" };
      }

      const iframeUrl = `https://www.paytr.com/odeme/guvenli/${data.token}`;
      return {
        success: true,
        redirectUrl: iframeUrl,
        transactionId: data.token,
        providerResponse: data as unknown as Record<string, unknown>,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Bağlantı hatası",
      };
    }
  }

  async verifyPayment(
    params: Record<string, string>
  ): Promise<VerifyPaymentResult> {
    const { merchant_oid, status, total_amount, hash } = params;

    const expectedHash = crypto
      .createHmac("sha256", this.merchantKey)
      .update(merchant_oid + this.merchantSalt + status + total_amount)
      .digest("base64");

    if (hash !== expectedHash) {
      return { success: false, error: "Hash doğrulaması başarısız" };
    }

    return {
      success: status === "success",
      orderId: merchant_oid,
      amount: parseInt(total_amount) / 100,
      providerResponse: params as unknown as Record<string, unknown>,
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const amountInKurus = Math.round(amount * 100).toString();

    const postData = {
      merchant_id: this.merchantId,
      return_id: transactionId,
      return_amount: amountInKurus,
      reference_no: crypto.randomUUID(),
    };

    const hash = this.generateHash(postData);
    const payload = { ...postData, paytr_token: hash };

    try {
      const response = await fetch(`${this.apiUrl}/api/re-fund`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload),
      });

      const data = (await response.json()) as {
        status: string;
        err_no?: string;
        err_msg?: string;
      };

      return {
        success: data.status === "success",
        error: data.err_msg,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "İade hatası",
      };
    }
  }
}

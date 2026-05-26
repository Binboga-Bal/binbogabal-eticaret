import crypto from "crypto";
import axios from "axios";
import type {
  PaymentAdapter,
  CreatePaymentParams,
  PaymentResult,
  VerifyPaymentResult,
  RefundResult,
  Smart3DFormPayload,
} from "./types";

export class QNBPayAdapter implements PaymentAdapter {
  readonly name = "QNB_PAY";

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly merchantKey: string;
  private readonly posId: string | undefined;
  private readonly baseUrl: string;

  constructor() {
    this.appId = process.env.QNB_PAY_APP_ID!;
    this.appSecret = process.env.QNB_PAY_APP_SECRET!;
    this.merchantKey = process.env.QNB_PAY_MERCHANT_KEY!;
    this.posId = process.env.QNB_PAY_POS_ID || undefined;

    const isSandbox = process.env.QNB_PAY_SANDBOX !== "false";
    // portal.qnbpay.com.tr hem token API'si hem form endpoint'i için kullanılır
    this.baseUrl = isSandbox
      ? "https://test.qnbpay.com.tr"
      : "https://portal.qnbpay.com.tr";
  }

  // Sunucu tarafında JWT token alır — kart verisi içermez, PCI-DSS uyumlu
  private async getToken(): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/ccpayment/api/token`,
      { app_id: this.appId, app_secret: this.appSecret },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 },
    );

    // Yanıt yapısı: { status_code: 100, data: { token: "..." } }
    const token = response.data?.data?.token ?? response.data?.token;
    if (response.data.status_code !== 100 || !token) {
      throw new Error(
        `Token alınamadı: ${response.data.error_message ?? JSON.stringify(response.data)}`,
      );
    }

    return token as string;
  }

  // QNBPay hash formülü: AES-256-CBC ile şifreli bundle
  // Veri: total|installments|currency_code|merchant_key|invoice_id
  private generateHashKey(data: string): string {
    const iv = crypto
      .createHash("sha1")
      .update(Math.random().toString())
      .digest("hex")
      .substring(0, 16);

    const salt = crypto
      .createHash("sha1")
      .update(Math.random().toString())
      .digest("hex")
      .substring(0, 4);

    const password = crypto
      .createHash("sha1")
      .update(this.appSecret)
      .digest("hex");

    const key = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex")
      .substring(0, 32);

    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(key, "utf8"),
      Buffer.from(iv, "utf8"),
    );

    const encrypted =
      cipher.update(data, "utf8", "base64") + cipher.final("base64");

    return `${iv}:${salt}:${encrypted}`.replaceAll("/", "__");
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const token = await this.getToken();
      const total = params.amount.toFixed(2);
      const installments = "1";
      const currency = params.currency ?? "TRY";

      const hashData = `${total}|${installments}|${currency}|${this.merchantKey}|${params.orderNumber}`;
      const hashKey = this.generateHashKey(hashData);

      const formPayload: Smart3DFormPayload = {
        authorization: `Bearer ${token}`,
        merchant_key: this.merchantKey,
        ...(this.posId ? { pos_id: this.posId } : {}),
        currency_code: currency,
        installments_number: installments,
        invoice_id: params.orderNumber,
        invoice_description: `Binboğa Kooperatif Balı - ${params.orderNumber}`,
        name: params.customer.name,
        surname: params.customer.surname,
        total,
        items: JSON.stringify(
          params.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            description: item.name,
          })),
        ),
        ip: params.customer.ip,
        transaction_type: "Auth",
        is_comission_from_user: "2",
        response_method: "GET",
        return_url: params.callbackUrl,
        cancel_url: params.cancelUrl,
        hash_key: hashKey,
        endpoint: `${this.baseUrl}/ccpayment/api/paySmart3D`,
      };

      return { success: true, formPayload };
    } catch (error: any) {
      if (error.response) {
        console.error("[QNBPay] Hata yanıtı:", error.response.data);
      } else {
        console.error("[QNBPay] Bağlantı hatası:", error.message);
      }
      return {
        success: false,
        error: `QNBPay hatası: ${error.message}`,
      };
    }
  }

  async verifyPayment(
    params: Record<string, string>,
  ): Promise<VerifyPaymentResult> {
    console.log("[QNBPay] Callback parametreleri:", params);

    const isSuccess = params.status === "1" || params.mdStatus === "1";

    return {
      success: isSuccess,
      orderId: params.invoice_id,
      transactionId: params.order_id ?? params.transaction_id,
      amount: params.amount ? parseFloat(params.amount) : undefined,
      providerResponse: params,
      error: isSuccess
        ? undefined
        : `3D Secure başarısız (status: ${params.status}, mdStatus: ${params.mdStatus})`,
    };
  }

  async refund(_invoiceId: string, _amount: number): Promise<RefundResult> {
    return { success: false, error: "İade fonksiyonu pasif." };
  }
}

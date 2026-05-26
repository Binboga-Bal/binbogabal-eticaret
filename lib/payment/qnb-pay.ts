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

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly merchantKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.appId = process.env.QNB_PAY_APP_ID!;
    this.appSecret = process.env.QNB_PAY_APP_SECRET!;
    this.merchantKey = process.env.QNB_PAY_MERCHANT_KEY!;
    const isSandbox = process.env.QNB_PAY_SANDBOX !== "false";
    // Test: test.qnbpay.com.tr | Prod: portal.qnbpay.com.tr
    this.baseUrl = isSandbox
      ? "https://test.qnbpay.com.tr"
      : "https://portal.qnbpay.com.tr";
  }

  private async fetchToken(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/ccpayment/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret }),
    });
    const raw = await res.text();
    let data: { data?: { token?: string } };
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`QNBPay token parse hatası: ${raw.substring(0, 200)}`);
    }
    if (!data?.data?.token) {
      throw new Error(`QNBPay token alınamadı: ${raw.substring(0, 300)}`);
    }
    return data.data.token;
  }

  // PHP openssl_encrypt ile birebir uyumlu AES-256-CBC şifreleme.
  // PHP key'i raw string bytes olarak kullanır; key 32 bayta truncate edilir.
  private aesEncrypt(
    plaintext: string
  ): { iv: string; salt: string; encrypted: string } {
    const iv = crypto
      .createHash("sha1")
      .update(crypto.randomBytes(16))
      .digest("hex")
      .substring(0, 16);
    const password = crypto
      .createHash("sha1")
      .update(this.appSecret)
      .digest("hex");
    const salt = crypto
      .createHash("sha1")
      .update(crypto.randomBytes(16))
      .digest("hex")
      .substring(0, 4);
    const saltWithPassword = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const keyBuf = Buffer.from(saltWithPassword.substring(0, 32), "latin1");
    const ivBuf = Buffer.from(iv, "latin1");

    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuf, ivBuf);
    const encrypted =
      cipher.update(plaintext, "utf8", "base64") + cipher.final("base64");
    return { iv, salt, encrypted };
  }

  private buildHashBundle(iv: string, salt: string, encrypted: string): string {
    return `${iv}:${salt}:${encrypted}`.replace(/\//g, "__");
  }

  generateHashKey(
    total: string,
    installment: string,
    currencyCode: string,
    invoiceId: string
  ): string {
    const plaintext = `${total}|${installment}|${currencyCode}|${this.merchantKey}|${invoiceId}`;
    const { iv, salt, encrypted } = this.aesEncrypt(plaintext);
    return this.buildHashBundle(iv, salt, encrypted);
  }

  // QNBPay'in callback'te gönderdiği hash_key'i çöz.
  // Çözülen format: status|total|invoiceId|orderId|currencyCode
  decryptCallbackHashKey(hashKey: string): {
    status: string;
    total: string;
    invoiceId: string;
    orderId: string;
    currencyCode: string;
  } | null {
    try {
      const raw = hashKey.replace(/__/g, "/");
      const parts = raw.split(":");
      if (parts.length < 3) return null;

      const [iv, salt, encryptedMsg] = parts;
      const password = crypto
        .createHash("sha1")
        .update(this.appSecret)
        .digest("hex");
      const saltWithPassword = crypto
        .createHash("sha256")
        .update(password + salt)
        .digest("hex");

      const keyBuf = Buffer.from(saltWithPassword.substring(0, 32), "latin1");
      const ivBuf = Buffer.from(iv, "latin1");

      const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuf, ivBuf);
      const decrypted =
        decipher.update(encryptedMsg, "base64", "utf8") +
        decipher.final("utf8");

      const arr = decrypted.split("|");
      return {
        status: arr[0] ?? "",
        total: arr[1] ?? "",
        invoiceId: arr[2] ?? "",
        orderId: arr[3] ?? "",
        currencyCode: arr[4] ?? "",
      };
    } catch {
      return null;
    }
  }

  // POST /ccpayment/purchase/link — kart verisi bizden geçmez (Güvenli Ödeme Sayfası)
  private async createPaymentLink(
    params: CreatePaymentParams,
    token: string
  ): Promise<PaymentResult> {
    const total = params.amount.toFixed(2);

    const body = {
      merchant_key: this.merchantKey,
      currency_code: params.currency ?? "TRY",
      invoice: {
        invoice_id: params.orderNumber,
        invoice_description: "Binboğa Kooperatif Balı Siparişi",
        total,
        return_url: params.callbackUrl,
        cancel_url: params.cancelUrl,
        response_method: "POST",
        items: params.items.map((item) => ({
          name: item.name,
          price: item.price.toFixed(2),
          quantity: item.quantity,
          description: item.name,
        })),
      },
      name: params.customer.name,
      surname: params.customer.surname,
      is_comission_from_user: "0",
    };

    const res = await fetch(`${this.baseUrl}/ccpayment/purchase/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    console.log("[QNBPay] purchase/link response:", raw.substring(0, 500));

    let data: {
      status_code?: number;
      status_description?: string;
      link?: string;
      order_id?: string;
      error_message?: string;
      message?: string;
    };
    try {
      data = JSON.parse(raw);
    } catch {
      return { success: false, error: `QNBPay parse hatası: ${raw.substring(0, 200)}` };
    }

    if (data.status_code !== 100 || !data.link) {
      const errMsg =
        data.error_message ?? data.message ?? data.status_description ?? `status_code: ${data.status_code}`;
      console.error("[QNBPay] purchase/link başarısız:", data);
      return { success: false, error: `QNBPay: ${errMsg}` };
    }

    return {
      success: true,
      redirectUrl: data.link,
      transactionId: data.order_id,
      providerResponse: data as unknown as Record<string, unknown>,
    };
  }

  // POST /ccpayment/api/paySmart3D — kart verisi sunucudan geçer, 3D HTML döner
  private async createPayment3D(
    params: CreatePaymentParams,
    token: string
  ): Promise<PaymentResult> {
    if (!params.card) {
      return { success: false, error: "Kart bilgileri eksik" };
    }

    const total = params.amount.toFixed(2);
    const installments = params.card.installments || 1;
    const hashKey = this.generateHashKey(
      total,
      String(installments),
      "TRY",
      params.orderNumber
    );

    const body = {
      cc_holder_name: params.card.holderName,
      cc_no: params.card.number.replace(/\s/g, ""),
      expiry_month: params.card.expiryMonth,
      expiry_year: params.card.expiryYear,
      cvv: params.card.cvv,
      currency_code: "TRY",
      installments_number: installments,
      invoice_id: params.orderNumber,
      invoice_description: "Binboğa Kooperatif Balı Siparişi",
      total,
      items: params.items.map((item) => ({
        name: item.name,
        price: item.price.toFixed(2),
        quantity: item.quantity,
        description: item.name,
      })),
      is_comission_from_user: 0,
      transaction_type: "Auth",
      payment_completed_by: "app",
      return_url: params.callbackUrl,
      cancel_url: params.cancelUrl,
      merchant_key: this.merchantKey,
      hash_key: hashKey,
    };

    const res = await fetch(`${this.baseUrl}/ccpayment/api/paySmart3D`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[QNBPay] paySmart3D HTTP error:", res.status, errText.substring(0, 200));
      return { success: false, error: "QNBPay 3D ödeme başlatılamadı" };
    }

    const htmlContent = await res.text();
    if (!htmlContent) {
      return { success: false, error: "QNBPay boş yanıt döndü" };
    }

    return { success: true, htmlContent, transactionId: params.orderNumber };
  }

  // Kart varsa paySmart3D, yoksa purchase/link kullan
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const token = await this.fetchToken();

    if (params.card) {
      return this.createPayment3D(params, token);
    }
    return this.createPaymentLink(params, token);
  }

  async verifyPayment(
    params: Record<string, string>
  ): Promise<VerifyPaymentResult> {
    const hashKey = params.hash_key;
    if (!hashKey) {
      return { success: false, error: "hash_key eksik" };
    }

    const decoded = this.decryptCallbackHashKey(hashKey);
    if (!decoded) {
      return { success: false, error: "Hash doğrulaması başarısız" };
    }

    return {
      success: decoded.status === "success",
      orderId: decoded.invoiceId,
      transactionId: decoded.orderId,
      amount: parseFloat(decoded.total) || undefined,
      providerResponse: params as unknown as Record<string, unknown>,
    };
  }

  async refund(invoiceId: string, amount: number): Promise<RefundResult> {
    const token = await this.fetchToken();
    const refundAmount = amount.toFixed(2);

    const plaintext = `${refundAmount}|${invoiceId}|${this.merchantKey}`;
    const { iv, salt, encrypted } = this.aesEncrypt(plaintext);
    const hashKey = this.buildHashBundle(iv, salt, encrypted);

    const res = await fetch(`${this.baseUrl}/ccpayment/api/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: refundAmount,
        invoice_id: invoiceId,
        merchant_key: this.merchantKey,
        hash_key: hashKey,
      }),
    });

    const result = (await res.json()) as { status?: string; message?: string };
    return {
      success: result.status === "success",
      error: result.message,
    };
  }
}

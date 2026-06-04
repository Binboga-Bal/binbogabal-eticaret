import axios from "axios";
import type {
  PaymentAdapter,
  CreatePaymentParams,
  PaymentResult,
  VerifyPaymentResult,
  RefundResult,
  Smart3DFormPayload,
  CheckStatusResult,
} from "./types";
import { generateHashKey, verifyHash } from "./qnb-hash";

export class QNBPayAdapter implements PaymentAdapter {
  readonly name = "QNB_PAY";

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly merchantKey: string;
  private readonly posId: string | undefined;
  private readonly baseUrl: string;
  private readonly isSandbox: boolean;

  constructor() {
    this.appId = process.env.QNB_PAY_APP_ID!;
    this.appSecret = process.env.QNB_PAY_APP_SECRET!;
    this.merchantKey = process.env.QNB_PAY_MERCHANT_KEY!;
    this.posId = process.env.QNB_PAY_POS_ID || undefined;

    this.isSandbox = process.env.QNB_PAY_SANDBOX !== "false";
    this.baseUrl = this.isSandbox
      ? "https://test.qnbpay.com.tr"
      : "https://portal.qnbpay.com.tr";
  }

  // QNBpay items dizisini oluşturur.
  // Kural: sum(item.price * item.quantity) == total (kargo + indirim dahil).
  // Kargo ve indirim ayrı satır olarak eklenir; toplam hâlâ uyuşmuyorsa
  // (float yuvarlama vb.) tek özetleme öğesiyle güvenli fallback yapılır.
  private buildQnbItems(params: CreatePaymentParams): string {
    type QnbItem = { name: string; price: number; quantity: number; description: string };

    const lines: QnbItem[] = params.items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      description: item.name,
    }));

    const shippingFee = params.shippingFee ?? 0;
    const discount    = params.discount    ?? 0;

    if (shippingFee > 0) {
      lines.push({ name: "Kargo Ücreti", price: shippingFee, quantity: 1, description: "Standart Kargo" });
    }
    if (discount > 0) {
      lines.push({ name: "İndirim", price: -discount, quantity: 1, description: "Kampanya / Kupon İndirimi" });
    }

    // Doğrulama: toplam eşleşmeli
    const sum     = Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;
    const total   = Math.round(params.amount * 100) / 100;

    if (Math.abs(sum - total) > 0.009) {
      // Güvenli fallback — tek öğe, tutar garantili eşleşir
      console.warn(`[QNBPay] items toplamı (${sum}) != total (${total}), fallback kullanılıyor`);
      return JSON.stringify([{
        name: params.items.map((i) => `${i.name} x${i.quantity}`).join(", ").substring(0, 200),
        price: params.amount,
        quantity: 1,
        description: `Sipariş #${params.orderNumber}`,
      }]);
    }

    return JSON.stringify(lines);
  }

  // Sunucu tarafında JWT token alır — kart verisi içermez, PCI-DSS uyumlu
  private async getToken(): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/ccpayment/api/token`,
      { app_id: this.appId, app_secret: this.appSecret },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 },
    );

    const token = response.data?.data?.token ?? response.data?.token;
    if (response.data.status_code !== 100 || !token) {
      throw new Error(
        `Token alınamadı: ${response.data.error_message ?? JSON.stringify(response.data)}`,
      );
    }

    return token as string;
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const token = await this.getToken();
      const total = params.amount.toFixed(2);
      const installments = "1";
      const currency = params.currency ?? "TRY";

      const hashData = `${total}|${installments}|${currency}|${this.merchantKey}|${params.orderNumber}`;
      const hashKey = generateHashKey(hashData, this.appSecret);

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
        items: this.buildQnbItems(params),
        ip: params.customer.ip,
        transaction_type: "Auth",
        // is_comission_from_user yalnızca taksit >= 2 ise gönderilir;
        // tek çekimde (installments="1") bu alan QNBpay tarafından reddedilebilir
        response_method: this.isSandbox ? "GET" : "POST",
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

  // QNBpay'den gerçek ödeme durumunu sorgular.
  // Callback query string'ine güvenmek yerine bu sonuç yetkilidir.
  async checkStatus(invoiceId: string): Promise<CheckStatusResult> {
    try {
      const token = await this.getToken();
      const hashData = `${invoiceId}|${this.merchantKey}`;
      const hashKey = generateHashKey(hashData, this.appSecret);

      const response = await axios.post(
        `${this.baseUrl}/ccpayment/api/checkstatus`,
        { invoice_id: invoiceId, merchant_key: this.merchantKey, hash_key: hashKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      const body = response.data;
      const data = body?.data ?? body;

      // Yanıttaki hash_key varsa doğrula
      const returnedHash: string | undefined = data?.hash_key;
      if (returnedHash && !verifyHash(returnedHash, hashData, this.appSecret)) {
        console.error("[QNBPay] checkstatus hash doğrulaması başarısız:", invoiceId);
        return {
          success: false,
          paymentStatus: undefined,
          transactionType: undefined,
          invoiceId,
          orderId: undefined,
          error: "checkstatus yanıtı hash doğrulamasından geçemedi",
        };
      }

      const rawStatus = data?.payment_status;
      const paymentStatus =
        typeof rawStatus === "number" ? rawStatus : rawStatus != null ? Number(rawStatus) : undefined;

      return {
        success: paymentStatus === 1,
        paymentStatus,
        transactionType: data?.transaction_type,
        invoiceId: data?.invoice_id ?? invoiceId,
        orderId: data?.order_id ?? data?.order_no,
        error:
          paymentStatus !== 1
            ? `Ödeme tamamlanmadı (payment_status=${paymentStatus ?? "yok"})`
            : undefined,
      };
    } catch (error: any) {
      const detail = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      console.error("[QNBPay] checkstatus API hatası:", detail);
      return {
        success: false,
        paymentStatus: undefined,
        transactionType: undefined,
        invoiceId,
        orderId: undefined,
        error: `checkstatus API hatası: ${error.message}`,
      };
    }
  }

  async verifyPayment(
    params: Record<string, string>,
  ): Promise<VerifyPaymentResult> {
    const invoiceId = params.invoice_id ?? params.order_no ?? "";

    // NOT: Callback hash_key'i burada doğrulamıyoruz.
    // QNBpay'in callback hash imza formatı netleşmediğinden yanlış red riski var.
    // Gerçek güvenlik doğrulaması checkStatus() API çağrısıyla yapılıyor.

    // QNBpay'in gönderebileceği tüm başarı göstergelerini kontrol et
    const isSuccess =
      params.qnbpay_status === "1" ||
      params.status === "1" ||
      params.mdStatus === "1" ||
      params.payment_status === "1";

    return {
      success: isSuccess,
      orderId: invoiceId || undefined,
      transactionId: params.order_id ?? params.order_no ?? params.transaction_id,
      amount: params.amount ? parseFloat(params.amount) : undefined,
      providerResponse: params,
      error: isSuccess
        ? undefined
        : `Ödeme başarısız (qnbpay_status=${params.qnbpay_status}, status=${params.status}, payment_status=${params.payment_status})`,
    };
  }

  async refund(_invoiceId: string, _amount: number): Promise<RefundResult> {
    return { success: false, error: "İade fonksiyonu pasif." };
  }
}

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

    // Callback'te hash_key geliyorsa doğrula (checkstatus formatı: invoice_id|merchant_key)
    const callbackHash = params.hash_key;
    if (callbackHash) {
      const expectedData = `${invoiceId}|${this.merchantKey}`;
      if (!verifyHash(callbackHash, expectedData, this.appSecret)) {
        console.error("[QNBPay] Callback hash doğrulaması başarısız — olası sahte istek");
        return {
          success: false,
          orderId: invoiceId || undefined,
          error: "Callback hash doğrulaması başarısız",
          providerResponse: params,
        };
      }
    }

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
        : `Ödeme başarısız (qnbpay_status=${params.qnbpay_status}, status=${params.status}, mdStatus=${params.mdStatus})`,
    };
  }

  async refund(_invoiceId: string, _amount: number): Promise<RefundResult> {
    return { success: false, error: "İade fonksiyonu pasif." };
  }
}

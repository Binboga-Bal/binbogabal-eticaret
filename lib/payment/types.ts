export interface PaymentCustomer {
  name: string;
  surname: string;
  email: string;
  phone: string;
  ip: string;
}

export interface PaymentAddress {
  firstName: string;
  lastName: string;
  city: string;
  district: string;
  fullAddress: string;
}

export interface PaymentItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface PaymentCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
}

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  shippingFee?: number;
  discount?: number;
  customer: PaymentCustomer;
  shippingAddress: PaymentAddress;
  items: PaymentItem[];
  card?: PaymentCard;
  callbackUrl: string;
  cancelUrl: string;
}

// Kart alanları dahil edilmez — browser doğrudan QNBPay'e POST eder
export interface Smart3DFormPayload {
  authorization: string;
  merchant_key: string;
  pos_id?: string;
  currency_code: string;
  installments_number: string;
  invoice_id: string;
  invoice_description: string;
  name: string;
  surname: string;
  total: string;
  items: string;
  ip: string;
  transaction_type: string;
  // Yalnızca 2+ taksitte gönderilir; tek çekimde (installments=1) undefined
  is_comission_from_user?: string;
  response_method: string;
  return_url: string;
  cancel_url: string;
  hash_key: string;
  endpoint: string;
}

export interface CheckStatusResult {
  success: boolean;
  paymentStatus: number | undefined;
  transactionType: string | undefined;
  invoiceId: string | undefined;
  orderId: string | undefined;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  redirectUrl?: string;
  formPayload?: Smart3DFormPayload;
  htmlContent?: string;
  transactionId?: string;
  error?: string;
  providerResponse?: Record<string, unknown>;
}

export interface VerifyPaymentResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  error?: string;
  providerResponse?: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface PaymentAdapter {
  readonly name: string;
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  verifyPayment(params: Record<string, string>): Promise<VerifyPaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

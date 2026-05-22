export interface PaymentCustomer {
  name: string;
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

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  customer: PaymentCustomer;
  shippingAddress: PaymentAddress;
  items: PaymentItem[];
  callbackUrl: string;
  cancelUrl: string;
  successUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  redirectUrl?: string;
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

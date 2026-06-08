// ─── Proxy API response types ─────────────────────────────────────────────────

export interface ProxyProduct {
  id: string;
  code: string;
  name: string;
  title: string;
  description: string;
  note: string;
  brand: string;
  category: string;
  product_tree: string[];
  barcode: string;
  image_url: string | null;
  units: Array<{ key: string; name: string }>;
  prices: {
    vat_rate: number;
    levels: Array<{ level: number; amount: number; currency: string }>;
    wholesale: number;
    retail: number;
    currency: string;
  };
  stock: {
    real: number;
    actual: number;
    b2c_warehouse: number;
  };
  status: "active" | "passive";
  warranty_months: number;
  b2c: {
    visible: boolean;
    is_new: boolean;
    free_shipping: boolean;
    discount_rate: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProxyListResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  from_cache: boolean;
}

export interface ProxyCallResponse<T = unknown> {
  data: T;
  from_cache: boolean;
}

// ─── ERP order/customer payload (pushOrderToErp için) ────────────────────────

export interface DiaCustomer {
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  erpCariAdresKey?: number; // Daha önce kaydedilmiş ERP cari adres key'i (tekrar siparişlerde kullanılır)
}

export interface DiaOrderLine {
  variantCode: string;
  variantKey: number;    // ERP stok kartının integer _key → _key_kalemturu
  unitKey: number;       // ERP birimin integer _key → _key_scf_kalem_birimleri
  quantity: number;
  unitPrice: number;     // Müşteriye yansıtılan fiyat (KDV dahil)
  kdvRate: number;       // KDV oranı (örn. 18)
}

export interface DiaOrder {
  erpOrderCode: string;
  lines: DiaOrderLine[];
  shippingAddress: {
    name: string;
    city: string;
    district: string;
    address: string;
    phone: string;
  };
  totalAmount: number;
  shippingFee?: number;
  discount?: number;
  notes?: string;
}

export interface ProxyOrderRequest {
  customer: DiaCustomer;
  order: DiaOrder;
}

export interface ProxyOrderResponse {
  erpOrderCode: string;     // ERP'nin atadığı fisno (ör. E2TC001858)
  erpCustomerCode: string;
  erpCariAdresKey?: number; // ERP cari adres _key — User.erpCariAdresKey'e kaydedilir
}

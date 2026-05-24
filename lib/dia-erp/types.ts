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

// ─── ERP order payload (pushOrderToErp için) ─────────────────────────────────

export interface DiaOrder {
  erpOrderCode: string;
  lines: {
    variantCode: string;
    quantity: number;
    unitPrice: number;
  }[];
  customerCode?: string;
  shippingAddress: {
    name: string;
    city: string;
    district: string;
    address: string;
    phone: string;
  };
  totalAmount: number;
}

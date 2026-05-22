export interface DiaProduct {
  code: string;
  name: string;
  description?: string;
  categoryCode?: string;
  barcode?: string;
  unit: string;
  isActive: boolean;
}

export interface DiaProductVariant {
  productCode: string;
  variantCode: string;
  attributes: Record<string, string>; // { size: "850", packaging: "glass" }
  price: number;
  stock: number;
  barcode?: string;
}

export interface DiaStock {
  variantCode: string;
  stock: number;
  warehouseCode?: string;
}

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

export interface DiaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

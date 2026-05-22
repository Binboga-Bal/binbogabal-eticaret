import type {
  DiaApiResponse,
  DiaProduct,
  DiaProductVariant,
  DiaStock,
  DiaOrder,
} from "./types";

export class DiaErpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly companyCode: string;

  constructor() {
    this.baseUrl = process.env.DIA_ERP_BASE_URL!;
    this.apiKey = process.env.DIA_ERP_API_KEY!;
    this.companyCode = process.env.DIA_ERP_COMPANY_CODE ?? "01";
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<DiaApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "X-Company-Code": this.companyCode,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Bağlantı hatası",
      };
    }
  }

  async getProducts(page = 1, pageSize = 100): Promise<DiaApiResponse<DiaProduct[]>> {
    return this.request<DiaProduct[]>(
      `/products?page=${page}&pageSize=${pageSize}`
    );
  }

  async getProductVariants(productCode: string): Promise<DiaApiResponse<DiaProductVariant[]>> {
    return this.request<DiaProductVariant[]>(
      `/products/${productCode}/variants`
    );
  }

  async getStockLevels(variantCodes?: string[]): Promise<DiaApiResponse<DiaStock[]>> {
    const body = variantCodes ? JSON.stringify({ codes: variantCodes }) : undefined;
    return this.request<DiaStock[]>("/stock", {
      method: variantCodes ? "POST" : "GET",
      body,
    });
  }

  async getPrices(variantCodes?: string[]): Promise<DiaApiResponse<{ variantCode: string; price: number }[]>> {
    const body = variantCodes ? JSON.stringify({ codes: variantCodes }) : undefined;
    return this.request("/prices", {
      method: variantCodes ? "POST" : "GET",
      body,
    });
  }

  async createOrder(order: DiaOrder): Promise<DiaApiResponse<{ erpOrderCode: string }>> {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  }

  async getOrderStatus(erpOrderCode: string): Promise<DiaApiResponse<{ status: string; trackingNo?: string }>> {
    return this.request(`/orders/${erpOrderCode}/status`);
  }
}

let client: DiaErpClient | null = null;

export function getDiaErpClient(): DiaErpClient {
  if (!client) client = new DiaErpClient();
  return client;
}

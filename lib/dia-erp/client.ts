import type { ProxyProduct, ProxyListResponse, ProxyCallResponse, ProxyOrderRequest, ProxyOrderResponse } from "./types";

interface TokenCache {
  token: string;
  expiresAt: number; // ms epoch
}

// "24h" | "3600" | 3600 → milliseconds
function parseExpiresIn(value: string | number): number {
  if (typeof value === "number") return value * 1000;
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 24 * 3600 * 1000;
  const n = parseInt(match[1]);
  const units: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * (units[match[2]] ?? 1000);
}

let tokenCache: TokenCache | null = null;

export class DiaProxyClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = (process.env.DIA_PROXY_URL ?? "http://localhost:3500").replace(/\/$/, "");
    this.apiKey = process.env.DIA_PROXY_API_KEY!;
  }

  private async getToken(): Promise<string> {
    const now = Date.now();
    if (tokenCache && tokenCache.expiresAt - now > 5 * 60 * 1000) {
      return tokenCache.token;
    }

    const res = await fetch(`${this.baseUrl}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: this.apiKey, client_id: "eticaret" }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Proxy auth hatası: ${res.status} — ${text}`);
    }

    const body = (await res.json()) as { token: string; expires_in: string | number };
    tokenCache = {
      token: body.token,
      expiresAt: now + parseExpiresIn(body.expires_in),
    };

    return body.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers as Record<string, string>),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Proxy ${path}: HTTP ${res.status} — ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async getProducts(limit = 100, offset = 0): Promise<ProxyListResponse<ProxyProduct>> {
    return this.request<ProxyListResponse<ProxyProduct>>(
      `/api/products?limit=${limit}&offset=${offset}`
    );
  }

  async erpCall<T = unknown>(
    action: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const body = await this.request<ProxyCallResponse<T>>("/api/erp/call", {
      method: "POST",
      body: JSON.stringify({ action, params: params ?? {} }),
    });
    return body.data;
  }

  async pushOrder(payload: ProxyOrderRequest): Promise<ProxyOrderResponse> {
    return this.request<ProxyOrderResponse>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

let client: DiaProxyClient | null = null;

export function getDiaErpClient(): DiaProxyClient {
  if (!client) client = new DiaProxyClient();
  return client;
}

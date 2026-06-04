"use client";

import { type LogCategory } from "@prisma/client";

const LABELS: Record<LogCategory, string> = {
  AUTH: "Kimlik",
  SESSION: "Oturum",
  PASSWORD: "Şifre",
  USER: "Kullanıcı",
  ACCOUNT: "Hesap",
  VERIFICATION: "Doğrulama",
  ORDER: "Sipariş",
  PAYMENT: "Ödeme",
  CART: "Sepet",
  COUPON: "Kupon",
  PRODUCT: "Ürün",
  CATEGORY: "Kategori",
  INVENTORY: "Stok",
  CAMPAIGN: "Kampanya",
  DISCOUNT: "İndirim",
  ADMIN: "Admin",
  ROLE: "Rol",
  SETTINGS: "Ayarlar",
  SECURITY: "Güvenlik",
  PERMISSION: "Yetki",
  RATE_LIMIT: "Hız Limiti",
  SYSTEM: "Sistem",
  API: "API",
  CRON: "Cron",
  DATA_EXPORT: "Veri Dışa",
  DATA_DELETE: "Veri Silme",
  GDPR: "KVKK",
};

export function LogCategoryBadge({ category }: { category: LogCategory }) {
  return (
    <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {LABELS[category] ?? category}
    </span>
  );
}

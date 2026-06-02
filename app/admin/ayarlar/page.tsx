export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Site Ayarları | Admin" };

const DEFAULT_SETTINGS = [
  { key: "site_name", label: "Site Adı", value: "Binboğa Kooperatif Balı" },
  { key: "site_description", label: "Site Açıklaması", value: "" },
  { key: "contact_phone", label: "İletişim Telefonu", value: "0 (322) 515 89 10" },
  { key: "contact_email", label: "İletişim E-postası", value: "info@binbogabal.com.tr" },
  { key: "contact_address", label: "Adres", value: "Kozan / Adana" },
  { key: "shipping_threshold", label: "Ücretsiz Kargo Limiti (₺)", value: "1500" },
  { key: "shipping_fee", label: "Kargo Ücreti (₺)", value: "99" },
  { key: "cash_on_delivery_enabled", label: "Kapıda Ödeme", value: "false", type: "toggle", description: "Aktifken müşteriler kapıda ödeme seçebilir" },
  { key: "social_instagram", label: "Instagram URL", value: "" },
  { key: "social_facebook", label: "Facebook URL", value: "" },
  { key: "social_whatsapp", label: "WhatsApp Numarası", value: "" },
];

const BANNER_SETTINGS = [
  {
    key: "cart_banner_enabled",
    label: "Sepet Kampanya Bandı",
    value: "false",
    type: "toggle",
    description: "Aktifken sepet sayfasının üstünde kampanya bildirimi gösterilir",
  },
  {
    key: "cart_banner_text_left",
    label: "Sol Metin",
    value: "Sepetindeki ürün sayısını artır, indirim kazan! 🍯",
  },
  {
    key: "cart_banner_text_right",
    label: "Sağ Metin",
    value: "",
  },
  {
    key: "cart_banner_color",
    label: "Renk",
    value: "honey",
    type: "select",
    options: [
      { label: "Bal (Turuncu)", value: "honey" },
      { label: "Yeşil", value: "green" },
      { label: "Mavi", value: "blue" },
      { label: "Kırmızı", value: "red" },
    ],
  },
];

export default async function AdminSettingsPage() {
  await requirePermission("settings", "view");
  const dbSettings = await prisma.siteSetting.findMany();
  const settingsMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));

  const settings = DEFAULT_SETTINGS.map((s) => ({ ...s, value: settingsMap[s.key] ?? s.value }));
  const bannerSettings = BANNER_SETTINGS.map((s) => ({ ...s, value: settingsMap[s.key] ?? s.value, options: (s as any).options }));

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-black text-gray-900">Site Ayarları</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SettingsForm settings={settings} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-5">Sepet Kampanya Bandı</h2>
        <p className="text-sm text-gray-500 mb-5 -mt-3">
          Sepet sayfasının üstünde header&apos;a yapışık bir bildirim bandı gösterir. Müşterileri aktif kampanyalar hakkında bilgilendirir.
        </p>
        <SettingsForm settings={bannerSettings} />
      </div>
    </div>
  );
}

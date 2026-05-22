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
  { key: "social_instagram", label: "Instagram URL", value: "" },
  { key: "social_facebook", label: "Facebook URL", value: "" },
  { key: "social_whatsapp", label: "WhatsApp Numarası", value: "" },
];

export default async function AdminSettingsPage() {
  const dbSettings = await prisma.siteSetting.findMany();
  const settingsMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));

  const settings = DEFAULT_SETTINGS.map((s) => ({
    ...s,
    value: settingsMap[s.key] ?? s.value,
  }));

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-black text-gray-900">Site Ayarları</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}

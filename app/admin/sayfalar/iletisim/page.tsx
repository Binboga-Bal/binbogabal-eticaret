export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";

export const metadata = { title: "İletişim Sayfası | Admin" };

const D = {
  hero_h1: "İletişim",
  hero_subtitle: "Her türlü soru ve öneriniz için buradayız.",
  address: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi\nAdana, Kozan",
  phone: "+90 (322) XXX XX XX",
  email: "info@binbogabal.com.tr",
  hours: "Pazartesi – Cuma: 09:00 – 18:00\nCumartesi: 09:00 – 13:00",
} as const;

const PFX = "page_iletisim_";
const ALL_KEYS = (Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`);

export default async function IletisimIcerigi() {
  await requirePermission("media", "view");
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  function tf(key: string, label: string, type: "text" | "textarea" = "text", rows?: number) {
    return {
      key: `${PFX}${key}`,
      label,
      type,
      defaultValue: (D as Record<string, string>)[key] ?? "",
      currentValue: db[`${PFX}${key}`] ?? null,
      rows,
    };
  }

  const sections = [
    {
      id: "hero",
      title: "Hero Bölümü",
      description: "Sayfanın üst koyu kahve bölümündeki başlık ve alt metin.",
      texts: [
        tf("hero_h1",       "Sayfa Başlığı (H1)"),
        tf("hero_subtitle", "Alt Metin"),
      ],
    },
    {
      id: "contact",
      title: "İletişim Bilgileri",
      description: "Sayfadaki adres, telefon, e-posta ve çalışma saatleri bilgileri.",
      texts: [
        tf("address", "Adres",             "textarea", 2),
        tf("phone",   "Telefon"),
        tf("email",   "E-posta"),
        tf("hours",   "Çalışma Saatleri",  "textarea", 2),
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">İletişim Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          İletişim sayfasının tüm statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}

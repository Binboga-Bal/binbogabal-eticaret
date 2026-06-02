export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { BannerManager } from "@/components/admin/BannerManager";
import {
  sliderTheme,
  trustBadgesTheme,
  processFlowTheme,
  homeBannersTheme,
  balRehberiTheme,
  footerTheme,
} from "@/lib/theme";

export const metadata = { title: "Görsel Yönetimi | Admin" };

const ALL_KEYS = [
  "img_logo",
  "img_slider_1", "img_slider_2", "img_slider_3",
  "img_home_hikayemiz", "img_home_hakkimizda",
  "img_badge_1", "img_badge_2", "img_badge_3", "img_badge_4",
  "img_process_1", "img_process_2", "img_process_3", "img_process_4",
  "banner_bal_rehberi", "banner_hakkimizda", "banner_urunlerimiz", "banner_iletisim",
  "img_bal_rehberi_guvence",
];

export default async function AdminBannersPage() {
  await requirePermission("media", "view");
  const dbSettings = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const db = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));

  const groups = [
    {
      title: "Site Logosu",
      description: "Header, footer ve arama ekranında kullanılan logo. Tüm alanlara tek kaynaktan yayılır.",
      items: [
        {
          key: "img_logo",
          label: "Logo",
          hint: "Header · Footer · Arama",
          currentUrl: db.img_logo ?? footerTheme.logo.src,
          recommendedSize: "230 × 150 px",
        },
      ],
    },
    {
      title: "Hero Slider",
      description: "Anasayfadaki tam ekran slider görselleri.",
      items: sliderTheme.slides.map((slide, i) => ({
        key: `img_slider_${i + 1}`,
        label: `Slider ${i + 1}`,
        hint: slide.primaryBtn.label,
        currentUrl: db[`img_slider_${i + 1}`] ?? slide.image ?? null,
        recommendedSize: "1920 × 700 px",
      })),
    },
    {
      title: "Anasayfa Bölüm Bannerleri",
      description: "Hikayemiz ve Hakkımızda bölümlerinin arka plan görselleri.",
      items: [
        {
          key: "img_home_hikayemiz",
          label: "Hikayemiz Bölümü",
          hint: homeBannersTheme.hikayemiz.heading,
          currentUrl: db.img_home_hikayemiz ?? homeBannersTheme.hikayemiz.image,
          recommendedSize: "1920 × 600 px",
        },
        {
          key: "img_home_hakkimizda",
          label: "Hakkımızda Bölümü",
          hint: homeBannersTheme.hakkimizda.heading,
          currentUrl: db.img_home_hakkimizda ?? homeBannersTheme.hakkimizda.image,
          recommendedSize: "1920 × 600 px",
        },
      ],
    },
    {
      title: "Sayfa Bannerleri",
      description: "İç sayfaların üst banner görselleri.",
      items: [
        { key: "banner_bal_rehberi", label: "Bal Rehberi", hint: "/bal-rehberi", currentUrl: db.banner_bal_rehberi ?? balRehberiTheme.banner.image, recommendedSize: "1920 × 600 px" },
        { key: "img_bal_rehberi_guvence", label: "Bal Rehberi — Güvence Bölümü", hint: "Kooperatif güvencesi arka plan", currentUrl: db.img_bal_rehberi_guvence ?? "/images/bal-rehberi/bal-rehberi-kooperatif-guvencesi.jpg", recommendedSize: "1920 × 600 px" },
        { key: "banner_hakkimizda", label: "Hakkımızda", hint: "/hakkimizda", currentUrl: db.banner_hakkimizda ?? null, recommendedSize: "1920 × 600 px" },
        { key: "banner_urunlerimiz", label: "Ürünlerimiz", hint: "/urunlerimiz", currentUrl: db.banner_urunlerimiz ?? "/images/urunlerimiz/urunlerimiz-banner.webp", recommendedSize: "1920 × 600 px" },
        { key: "banner_iletisim", label: "İletişim", hint: "/iletisim", currentUrl: db.banner_iletisim ?? null, recommendedSize: "1920 × 600 px" },
      ],
    },
    {
      title: "Güven Rozetleri",
      description: "Anasayfadaki 4 infografik rozet görseli.",
      items: trustBadgesTheme.badges.map((badge, i) => ({
        key: `img_badge_${i + 1}`,
        label: badge.title,
        hint: badge.description,
        currentUrl: db[`img_badge_${i + 1}`] ?? badge.image,
        recommendedSize: "400 × 400 px",
      })),
    },
    {
      title: "Süreç Adımları",
      description: "Anasayfadaki 4 adım infografik görselleri.",
      items: processFlowTheme.steps.map((step, i) => ({
        key: `img_process_${i + 1}`,
        label: step.title,
        hint: `Adım ${step.number}`,
        currentUrl: db[`img_process_${i + 1}`] ?? step.image,
        recommendedSize: "400 × 400 px",
      })),
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Görsel Yönetimi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sitedeki tüm sabit görselleri buradan yönetin. Değişiklikler anında yayına girer.
        </p>
      </div>
      <BannerManager groups={groups} />
    </div>
  );
}

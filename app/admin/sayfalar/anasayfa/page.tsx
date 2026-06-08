export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";
import {
  sliderTheme,
  trustBadgesTheme,
  processFlowTheme,
  homeBannersTheme,
  footerTheme,
} from "@/lib/theme";

export const metadata = { title: "Anasayfa İçeriği | Admin" };

const KEYS = [
  "img_logo",
  "img_slider_1", "img_slider_2", "img_slider_3",
  "img_home_hikayemiz", "img_home_hakkimizda",
  "img_badge_1", "img_badge_2", "img_badge_3", "img_badge_4",
  "img_process_1", "img_process_2", "img_process_3", "img_process_4",
  "text_home_hikayemiz_heading", "text_home_hikayemiz_subheading",
  "text_home_hikayemiz_body", "text_home_hikayemiz_btn",
  "text_home_hakkimizda_heading", "text_home_hakkimizda_subheading",
  "text_home_hakkimizda_body", "text_home_hakkimizda_btn",
  "text_home_process_heading",
  "text_home_badge_1_title", "text_home_badge_1_desc",
  "text_home_badge_2_title", "text_home_badge_2_desc",
  "text_home_badge_3_title", "text_home_badge_3_desc",
  "text_home_badge_4_title", "text_home_badge_4_desc",
  "text_home_process_1_title", "text_home_process_1_desc",
  "text_home_process_2_title", "text_home_process_2_desc",
  "text_home_process_3_title", "text_home_process_3_desc",
  "text_home_process_4_title", "text_home_process_4_desc",
];

export default async function AnasayfaIcerigi() {
  await requirePermission("media", "view");
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const sections = [
    {
      id: "logo",
      title: "Site Logosu",
      description: "Header, footer ve arama ekranında kullanılan logo. Tüm alanlara tek kaynaktan yayılır.",
      images: [
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
      id: "slider",
      title: "Hero Slider",
      description: "Anasayfadaki tam ekran slider görselleri.",
      images: sliderTheme.slides.map((slide, i) => ({
        key: `img_slider_${i + 1}`,
        label: `Slider ${i + 1}`,
        hint: slide.primaryBtn.label,
        currentUrl: db[`img_slider_${i + 1}`] ?? slide.image ?? null,
        recommendedSize: "1920 × 700 px",
      })),
    },
    {
      id: "hikayemiz",
      title: "Hikayemiz Bölümü",
      description: "Anasayfadaki Hikayemiz bölümünün görseli ve metin içerikleri.",
      images: [
        {
          key: "img_home_hikayemiz",
          label: "Arka Plan Görseli",
          hint: "Hikayemiz bölümü arka planı",
          currentUrl: db.img_home_hikayemiz ?? homeBannersTheme.hikayemiz.image,
          recommendedSize: "1920 × 600 px",
        },
      ],
      texts: [
        {
          key: "text_home_hikayemiz_heading",
          label: "Başlık",
          type: "text" as const,
          defaultValue: homeBannersTheme.hikayemiz.heading,
          currentValue: db.text_home_hikayemiz_heading ?? null,
          placeholder: homeBannersTheme.hikayemiz.heading,
        },
        {
          key: "text_home_hikayemiz_subheading",
          label: "Alt Başlık",
          type: "text" as const,
          defaultValue: homeBannersTheme.hikayemiz.subheading,
          currentValue: db.text_home_hikayemiz_subheading ?? null,
          placeholder: homeBannersTheme.hikayemiz.subheading,
        },
        {
          key: "text_home_hikayemiz_body",
          label: "İçerik Metni",
          type: "textarea" as const,
          defaultValue: homeBannersTheme.hikayemiz.body,
          currentValue: db.text_home_hikayemiz_body ?? null,
          placeholder: "Bölüm açıklama metni...",
          rows: 6,
        },
        {
          key: "text_home_hikayemiz_btn",
          label: "Buton Metni",
          type: "text" as const,
          defaultValue: homeBannersTheme.hikayemiz.btn.label,
          currentValue: db.text_home_hikayemiz_btn ?? null,
          placeholder: homeBannersTheme.hikayemiz.btn.label,
        },
      ],
    },
    {
      id: "hakkimizda",
      title: "Hakkımızda Bölümü",
      description: "Anasayfadaki Hakkımızda bölümünün görseli ve metin içerikleri.",
      images: [
        {
          key: "img_home_hakkimizda",
          label: "Arka Plan Görseli",
          hint: "Hakkımızda bölümü arka planı",
          currentUrl: db.img_home_hakkimizda ?? homeBannersTheme.hakkimizda.image,
          recommendedSize: "1920 × 600 px",
        },
      ],
      texts: [
        {
          key: "text_home_hakkimizda_heading",
          label: "Başlık",
          type: "text" as const,
          defaultValue: homeBannersTheme.hakkimizda.heading,
          currentValue: db.text_home_hakkimizda_heading ?? null,
          placeholder: homeBannersTheme.hakkimizda.heading,
        },
        {
          key: "text_home_hakkimizda_subheading",
          label: "Alt Başlık",
          type: "text" as const,
          defaultValue: homeBannersTheme.hakkimizda.subheading,
          currentValue: db.text_home_hakkimizda_subheading ?? null,
          placeholder: homeBannersTheme.hakkimizda.subheading,
        },
        {
          key: "text_home_hakkimizda_body",
          label: "İçerik Metni",
          type: "textarea" as const,
          defaultValue: homeBannersTheme.hakkimizda.body,
          currentValue: db.text_home_hakkimizda_body ?? null,
          placeholder: "Bölüm açıklama metni...",
          rows: 6,
        },
        {
          key: "text_home_hakkimizda_btn",
          label: "Buton Metni",
          type: "text" as const,
          defaultValue: homeBannersTheme.hakkimizda.btn.label,
          currentValue: db.text_home_hakkimizda_btn ?? null,
          placeholder: homeBannersTheme.hakkimizda.btn.label,
        },
      ],
    },
    {
      id: "guven-rozetleri",
      title: "Güven Rozetleri",
      description: "Anasayfadaki 4 infografik rozet görselleri ve metin içerikleri.",
      images: trustBadgesTheme.badges.map((badge, i) => ({
        key: `img_badge_${i + 1}`,
        label: badge.title,
        hint: badge.description,
        currentUrl: db[`img_badge_${i + 1}`] ?? badge.image,
        recommendedSize: "400 × 400 px",
      })),
      texts: trustBadgesTheme.badges.flatMap((badge, i) => [
        {
          key: `text_home_badge_${i + 1}_title`,
          label: `Rozet ${i + 1} — Başlık`,
          type: "text" as const,
          defaultValue: badge.title,
          currentValue: db[`text_home_badge_${i + 1}_title`] ?? null,
          placeholder: badge.title,
        },
        {
          key: `text_home_badge_${i + 1}_desc`,
          label: `Rozet ${i + 1} — Açıklama`,
          type: "text" as const,
          defaultValue: badge.description,
          currentValue: db[`text_home_badge_${i + 1}_desc`] ?? null,
          placeholder: badge.description,
        },
      ]),
    },
    {
      id: "surec-adımlari",
      title: "Süreç Adımları",
      description: "Anasayfadaki 4 adım infografik görselleri ve metin içerikleri.",
      images: processFlowTheme.steps.map((step, i) => ({
        key: `img_process_${i + 1}`,
        label: step.title,
        hint: `Adım ${step.number}`,
        currentUrl: db[`img_process_${i + 1}`] ?? step.image,
        recommendedSize: "400 × 400 px",
      })),
      texts: [
        {
          key: "text_home_process_heading",
          label: "Bölüm Başlığı",
          type: "text" as const,
          defaultValue: processFlowTheme.heading,
          currentValue: db.text_home_process_heading ?? null,
          placeholder: processFlowTheme.heading,
        },
        ...processFlowTheme.steps.flatMap((step, i) => [
          {
            key: `text_home_process_${i + 1}_title`,
            label: `Adım ${i + 1} — Başlık`,
            type: "text" as const,
            defaultValue: step.title,
            currentValue: db[`text_home_process_${i + 1}_title`] ?? null,
            placeholder: step.title,
          },
          {
            key: `text_home_process_${i + 1}_desc`,
            label: `Adım ${i + 1} — Açıklama`,
            type: "textarea" as const,
            defaultValue: step.description,
            currentValue: db[`text_home_process_${i + 1}_desc`] ?? null,
            rows: 3,
          },
        ]),
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Anasayfa İçeriği</h1>
        <p className="text-sm text-gray-500 mt-1">
          Anasayfanın tüm statik görsel ve metin içeriklerini buradan yönetin. Değişiklikler kısa sürede yayına girer.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}

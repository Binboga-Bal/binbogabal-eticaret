export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { PageContentManager } from "@/components/admin/PageContentManager";

export const metadata = { title: "Kooperatif Hikayemiz Sayfası | Admin" };

const D = {
  hero_badge: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi",
  hero_h1_line1: "Arının Emeği,",
  hero_h1_line2: "Kooperatifin Güvencesi",
  hero_subtitle: "1973'te bir avuç arıcının kurduğu bu yapı, bugün 1800'den fazla aileyi birbirine bağlıyor. Kâr değil dayanışma; hissedar değil arıcı önce.",
  stat_1_value: "1973",    stat_1_label: "Kuruluş Yılı",
  stat_2_value: "1800+",   stat_2_label: "Arıcı Üye",
  stat_3_value: "45.000+", stat_3_label: "Kovan",
  stat_4_value: "50+",     stat_4_label: "Yıllık Deneyim",
  coop_tag: "Kooperatifçilik Nedir?",
  coop_heading: "Şirket değil, ortak akıl",
  coop_p1: "Kooperatif; ortak ekonomik, sosyal ve kültürel ihtiyaçları karşılamak için gönüllü olarak bir araya gelen insanların oluşturduğu, demokratik olarak kontrol edilen bağımsız bir kuruluştur.",
  coop_p2: "Bir şirkette hissedar ne kadar çok pay sahibiyse o kadar çok söz hakkı alır. Kooperatifte ise her üye, sahip olduğu hisse miktarından bağımsız olarak tek oy hakkına sahiptir. Bu fark her şeyi değiştirir.",
  coop_p3: "Dünya genelinde 3 milyondan fazla kooperatif, 1 milyarın üzerinde üyeyle faaliyet göstermektedir. Türkiye'de ise tarımsal kooperatifler küçük üreticinin en büyük kalkanı olmaya devam ediyor.",
  process_tag: "Süreç",
  process_heading: "Kovandan Sofranıza, Adım Adım",
  process_1_step: "01", process_1_title: "Arıcı Teslim Eder",
  process_1_desc: "Üye arıcı hasadını doğrudan kooperatif deposuna getirir. Hiçbir aracı el sürmez.",
  process_2_step: "02", process_2_title: "Kooperatif Analiz Eder",
  process_2_desc: "Her parti bal Türk Gıda Kodeksi'ne uygun bağımsız laboratuvarda test edilir.",
  process_3_step: "03", process_3_title: "Merkezi Ambalajlama",
  process_3_desc: "Testleri geçen bal kooperatifin tesisinde standart kavanozlara doldurulur.",
  process_4_step: "04", process_4_title: "Adil Fiyat, Şeffaf Kâr",
  process_4_desc: "Yıl sonunda elde edilen gelir üyelere katılımları oranında paylaştırılır.",
  history_tag: "Tarihimiz",
  history_heading: "50 Yılın Hikayesi",
  chapter_1_year: "1973",    chapter_1_title: "Bir Karar, Bir Başlangıç",
  chapter_1_body: "Kozan'ın dağlarında yaşayan birkaç arıcı aile, yalnız başlarına piyasayla başa çıkamadıklarını fark etti. Tüccarlar fiyatı belirliyor, arıcı boyun eğiyordu. İşte o gün masaya oturdu ve S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'ni kurdular. Amaç basitti: emeği koruyan, sömürüye kapı açmayan bir yapı.",
  chapter_2_year: "1980'ler", chapter_2_title: "Kovan Sayısı Artıyor",
  chapter_2_body: "Kooperatif büyüdükçe arıcılar güvende hissetti. İlk ortak ambalajlama tesisi kuruldu. Kozan balının kalitesi bölge dışına çıkmaya başladı. Her yıl onlarca yeni arıcı aile kooperatif çatısı altına sığındı.",
  chapter_3_year: "1997",    chapter_3_title: "Dünyaya Açılış",
  chapter_3_body: "İhracat kapısı aralandı. Almanya ve Hollanda'daki Türk toplulukları, Kozan balını sofralarına taşıdı. Bu sadece bir pazar değildi — Toroslar'ın kekik aromasının Avrupa'da tanınmasıydı.",
  chapter_4_year: "2008",    chapter_4_title: "Güvenin Belgesi",
  chapter_4_body: "ISO 22000 Gıda Güvenliği sertifikası alındı. Artık kooperatif balını sadece arıcı değil, uluslararası denetçiler de onaylıyordu. Güven kurumsal bir kimliğe kavuştu.",
  chapter_5_year: "2015",    chapter_5_title: "1000 Aile, 1000 Umut",
  chapter_5_body: "Üye sayısı 1000'i aştı. Toros dağlarındaki kovanlarda 45 000 koloni. Her kovan bir ailenin geçimini, her aile bir kooperatifin gücünü temsil ediyordu.",
  chapter_6_year: "2022",    chapter_6_title: "Altın Mühür",
  chapter_6_body: "London Honey Awards'tan altın ödül geldi. Toroslar'ın çiçek balı dünya sahnesinde boy gösterdi. Ama kooperatif için asıl ödül her zaman arıcıların yüzündeki gülümseme oldu.",
  chapter_7_year: "2024",    chapter_7_title: "Arıcıdan Sofranıza",
  chapter_7_body: "E-ticaret platformumuz açıldı. Artık bir tıkla Kozan'dan kapınıza; aracısız, komisyonsuz, sertifikalı. Kooperatifçiliğin ruhunu dijital çağa taşıdık.",
  voices_tag: "Sesler",
  voices_heading: "Onlar Anlatsın",
  voice_1_quote: "Kooperatif olmasaydı, balam için istediğim fiyatı alamazdım. Şimdi hasat sonunda ne alacağımı biliyorum.",
  voice_1_name: "Mehmet Demir", voice_1_detail: "22 yıllık üye, Kozan",
  voice_2_quote: "Tek başıma laboratuvar analizi yaptıramazdım. Kooperatif hem kaliteyi hem de güveni getirdi.",
  voice_2_name: "Hatice Şahin", voice_2_detail: "15 yıllık üye, Feke",
  voice_3_quote: "Babamdan kalan 40 kovanı kooperatife bağladım. Artık çocuklarıma bu mesleği öğretmekten çekinmiyorum.",
  voice_3_name: "Ali Öztürk", voice_3_detail: "8 yıllık üye, Saimbeyli",
  manifesto_tag: "Neden Biz?",
  manifesto_heading_1: "Bir ürün almıyorsunuz.",
  manifesto_heading_2: "Bir sistemi destekliyorsunuz.",
  manifesto_p1: "Her kavanozu satın aldığınızda, Kozan'daki bir arıcı ailesine adil fiyat ödeniyor. Hiçbir aracı komisyon almıyor. Kooperatif yönetim kurulu gönüllü üyelerden oluşuyor.",
  manifesto_p2: "Bu, sanayileşmiş bal endüstrisine karşı küçük bir direniş. Arının emeğine saygının, toprağa bağlılığın ve insanlar arası güvenin sembolü.",
  manifesto_p3: "Siz her sipariş verdiğinizde 1973'teki o ilk kararı güçlendiriyorsunuz: birlikte daha güçlüyüz.",
  cta_heading: "Kooperatif balını keşfedin",
  cta_text: "Arıcıdan sofranıza — aracısız, analiz sertifikalı, kooperatif güvenceli.",
  cta_btn_1: "Ürünlerimizi İncele →",
  cta_btn_2: "Hakkımızda",
} as const;

const PFX = "page_koophistory_";
const ALL_KEYS = [...(Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`), "banner_kooperatif_hikayemiz"];

export default async function KooperatifHikayemizAdmin() {
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
      id: "banner",
      title: "Sayfa Banneri",
      images: [{ key: "banner_kooperatif_hikayemiz", label: "Kooperatif Hikayemiz Banneri", hint: "/kooperatif-hikayemiz", currentUrl: db.banner_kooperatif_hikayemiz ?? null, recommendedSize: "1920 × 600 px" }],
    },
    {
      id: "hero",
      title: "Hero Bölümü",
      texts: [
        tf("hero_badge",    "Rozet/Etiket Metni"),
        tf("hero_h1_line1", "Başlık 1. Satır"),
        tf("hero_h1_line2", "Başlık 2. Satır (vurgulu)"),
        tf("hero_subtitle", "Alt Metin", "textarea", 2),
      ],
    },
    {
      id: "stats",
      title: "İstatistikler",
      texts: [1, 2, 3, 4].flatMap((i) => [
        tf(`stat_${i}_value`, `İstatistik ${i} — Değer`),
        tf(`stat_${i}_label`, `İstatistik ${i} — Etiket`),
      ]),
    },
    {
      id: "coop",
      title: "Kooperatifçilik Bölümü",
      texts: [
        tf("coop_tag",     "Küçük Etiket"),
        tf("coop_heading", "Başlık"),
        tf("coop_p1",      "1. Paragraf", "textarea", 3),
        tf("coop_p2",      "2. Paragraf", "textarea", 3),
        tf("coop_p3",      "3. Paragraf", "textarea", 3),
      ],
    },
    {
      id: "process",
      title: "Nasıl Çalışır? (4 Adım)",
      texts: [
        tf("process_tag",     "Küçük Etiket"),
        tf("process_heading", "Başlık"),
        ...[1, 2, 3, 4].flatMap((i) => [
          tf(`process_${i}_step`,  `Adım ${i} — Numara`),
          tf(`process_${i}_title`, `Adım ${i} — Başlık`),
          tf(`process_${i}_desc`,  `Adım ${i} — Açıklama`, "textarea", 2),
        ]),
      ],
    },
    {
      id: "history",
      title: "Tarihsel Yolculuk (7 Bölüm)",
      texts: [
        tf("history_tag",     "Küçük Etiket"),
        tf("history_heading", "Bölüm Başlığı"),
        ...[1, 2, 3, 4, 5, 6, 7].flatMap((i) => [
          tf(`chapter_${i}_year`,  `Bölüm ${i} — Yıl`),
          tf(`chapter_${i}_title`, `Bölüm ${i} — Başlık`),
          tf(`chapter_${i}_body`,  `Bölüm ${i} — İçerik`, "textarea", 3),
        ]),
      ],
    },
    {
      id: "voices",
      title: "Arıcılar Konuşuyor (3 Alıntı)",
      texts: [
        tf("voices_tag",     "Küçük Etiket"),
        tf("voices_heading", "Bölüm Başlığı"),
        ...[1, 2, 3].flatMap((i) => [
          tf(`voice_${i}_quote`,  `Alıntı ${i}`, "textarea", 2),
          tf(`voice_${i}_name`,   `Alıntı ${i} — İsim`),
          tf(`voice_${i}_detail`, `Alıntı ${i} — Detay`),
        ]),
      ],
    },
    {
      id: "manifesto",
      title: "Manifesto Bölümü",
      texts: [
        tf("manifesto_tag",       "Küçük Etiket"),
        tf("manifesto_heading_1", "Başlık 1. Satır"),
        tf("manifesto_heading_2", "Başlık 2. Satır (vurgulu)"),
        tf("manifesto_p1",        "1. Paragraf", "textarea", 3),
        tf("manifesto_p2",        "2. Paragraf", "textarea", 3),
        tf("manifesto_p3",        "3. Paragraf", "textarea", 3),
      ],
    },
    {
      id: "cta",
      title: "CTA Bölümü",
      texts: [
        tf("cta_heading", "Başlık"),
        tf("cta_text",    "Açıklama", "textarea", 2),
        tf("cta_btn_1",   "1. Buton Metni"),
        tf("cta_btn_2",   "2. Buton Metni"),
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Kooperatif Hikayemiz Sayfası</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kooperatif Hikayemiz sayfasının tüm statik içeriklerini buradan yönetin.
        </p>
      </div>
      <PageContentManager sections={sections} />
    </div>
  );
}

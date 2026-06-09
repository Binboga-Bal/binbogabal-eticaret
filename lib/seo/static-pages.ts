const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";

export interface StaticPageDef {
  id: string;         // SeoMeta entityId
  path: string;       // URL yolu
  name: string;       // Görünen ad
  defaultTitle: string;
  defaultDescription: string;
  changeFreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

export const STATIC_PAGES: StaticPageDef[] = [
  {
    id: "home",
    path: "/",
    name: "Anasayfa",
    defaultTitle: "Kozan'dan Doğal Bal | Binboğa Kooperatif Balı",
    defaultDescription: "1973'ten bu yana 745 Sayılı Kozan Bal Tarım Satış Kooperatifi. Doğal, analizi yapılmış kooperatif balı.",
    changeFreq: "daily",
    priority: 1.0,
  },
  {
    id: "urunlerimiz",
    path: "/urunlerimiz",
    name: "Ürünlerimiz",
    defaultTitle: "Doğal Bal Ürünleri | Binboğa Kooperatif Balı",
    defaultDescription: "Çiçek balı, kekik balı, çam balı, kestane balı ve daha fazlası. Kooperatif güvencesiyle analizi yapılmış doğal ballar.",
    changeFreq: "daily",
    priority: 0.9,
  },
  {
    id: "bal-rehberi",
    path: "/bal-rehberi",
    name: "Bal Rehberi",
    defaultTitle: "Bal Rehberi | Binboğa Kooperatif Balı",
    defaultDescription: "Bal hakkında her şey. Gerçek bal nasıl anlaşılır, çocuklar için bal, bal saklama.",
    changeFreq: "weekly",
    priority: 0.7,
  },
  {
    id: "hakkimizda",
    path: "/hakkimizda",
    name: "Hakkımızda",
    defaultTitle: "Hakkımızda | Binboğa Kooperatif Balı",
    defaultDescription: "1973'ten bu yana Kozan'ın dağlarından gelen doğal bal. S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'nin hikayesi.",
    changeFreq: "monthly",
    priority: 0.5,
  },
  {
    id: "kooperatif-hikayemiz",
    path: "/kooperatif-hikayemiz",
    name: "Kooperatif Hikayemiz",
    defaultTitle: "Kooperatif Hikayemiz | Binboğa Kooperatif Balı",
    defaultDescription: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'nin 50 yıllık hikayesi.",
    changeFreq: "monthly",
    priority: 0.5,
  },
  {
    id: "iletisim",
    path: "/iletisim",
    name: "İletişim",
    defaultTitle: "İletişim | Binboğa Kooperatif Balı",
    defaultDescription: "Binboğa Bal ile iletişime geçin. Adres, telefon ve e-posta bilgilerimiz.",
    changeFreq: "monthly",
    priority: 0.5,
  },
  {
    id: "sss",
    path: "/sss",
    name: "Sık Sorulan Sorular",
    defaultTitle: "Sık Sorulan Sorular | Binboğa Kooperatif Balı",
    defaultDescription: "Binboğa bal ürünleri, sipariş ve teslimat hakkında sık sorulan sorular ve cevapları.",
    changeFreq: "monthly",
    priority: 0.6,
  },
  {
    id: "gizlilik",
    path: "/gizlilik",
    name: "Gizlilik Politikası",
    defaultTitle: "Gizlilik Politikası | Binboğa Kooperatif Balı",
    defaultDescription: "Kişisel verilerinizin korunması ve gizlilik politikamız.",
    changeFreq: "yearly",
    priority: 0.3,
  },
  {
    id: "kvkk",
    path: "/kvkk",
    name: "KVKK Aydınlatma",
    defaultTitle: "KVKK Aydınlatma Metni | Binboğa Kooperatif Balı",
    defaultDescription: "6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
    changeFreq: "yearly",
    priority: 0.3,
  },
  {
    id: "mesafeli-satis",
    path: "/mesafeli-satis",
    name: "Mesafeli Satış Sözleşmesi",
    defaultTitle: "Mesafeli Satış Sözleşmesi | Binboğa Kooperatif Balı",
    defaultDescription: "Uzaktan satış koşulları ve tüketici hakları.",
    changeFreq: "yearly",
    priority: 0.3,
  },
  {
    id: "iade-degisim",
    path: "/iade-degisim",
    name: "İade ve Değişim",
    defaultTitle: "İade ve Değişim Politikası | Binboğa Kooperatif Balı",
    defaultDescription: "Ürün iade ve değişim koşulları, tüketici haklarınız.",
    changeFreq: "yearly",
    priority: 0.3,
  },
];

export function getStaticPageUrl(id: string) {
  const page = STATIC_PAGES.find((p) => p.id === id);
  return page ? `${BASE_URL}${page.path}` : BASE_URL;
}

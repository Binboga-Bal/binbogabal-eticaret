/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           BİNBOĞA BAL — MERKEZİ TEMA DOSYASI               ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  Projedeki TÜM renk, boyut ve stil sabitleri burada         ║
 * ║  tanımlanır. Bir rengi değiştirmek için sadece bu dosyayı   ║
 * ║  düzenle — tailwind.config.ts, Header, Slider vb. otomatik  ║
 * ║  güncellenir.                                               ║
 * ║                                                             ║
 * ║  globals.css'teki CSS değişkenleri bu dosyayla              ║
 * ║  senkronize tutulmalıdır (bakım notu aşağıda).              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────────────
// § 1 — ANA RENK PALETİ
// ─────────────────────────────────────────────────────────────────────────────

export const palette = {
  /** Koyu kırmızı-kahve — birincil marka rengi */
  honeyDark: "#C57930",
  /** Orta ton — altın turuncu */
  honeyMedium: "#D67503",
  /** Ana bal sarısı */
  honey: "#F9B10B",
  /** Parlak sarı — vurgu */
  honeyBright: "#FCD908",
  /** Açık sarı — arka plan aksan */
  honeyLight: "#FCE7A5",
  /** Krem — çok açık arka planlar */
  honeyCream: "#FFF8E7",

  // Nötr
  white: "#FFFFFF",
  black: "#000000",

  // Gri scala
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 2 — HEADER
// ─────────────────────────────────────────────────────────────────────────────

export const headerTheme = {
  // Renkler
  announcementBg: palette.honeyDark,
  announcementText: palette.white,
  bg: palette.white,

  /** Wave (arch) SVG dolgu rengi — header arka planıyla aynı */
  waveFill: palette.white,
  /** Wave alt kenarı çizgi rengi — duyuru bandıyla eşleşir */
  waveStroke: palette.honeyDark,
  /** Wave kenar çizgisi kalınlığı (1440-birimlik viewBox'ta) */
  waveStrokeWidth: 6,
  /** Wave kenar gölge rengi (ince, şeffaf) */
  waveShadow: "rgba(184, 44, 0, 0.18)",

  // Boyutlar (px)
  navHeight: 82, // nav satırının yüksekliği
  announcementHeight: 40, // duyuru bandı yüksekliği
  waveDepth: 90, // arch'ın en derin noktası (arttırıldı: 60→80)
  logoWidth: 230, // logo genişliği
  logoHeight: 150, // logo maksimum yüksekliği
  /** Logo ile wave dibinin en derin noktası arasındaki boşluk (px).
   *  Logo container'ına paddingBottom olarak uygulanır;
   *  değeri artırınca logo daha yukarı kayar. */
  logoBottomPad: 20,

  /**
   * Header'ın "katı" bölümü (duyuru + nav).
   * <main> için paddingTop olarak kullanılır; wave bu alanın altından
   * içeriğin üstüne waveDepth kadar taşar.
   *   solidHeight = announcementHeight + navHeight = 40 + 85 = 125 px
   *
   * ⚠️  announcementHeight veya navHeight değiştiğinde burası da güncellenmeli.
   */
  solidHeight: 125,

  // Arch noktaları — 1440-birimlik viewBox üzerinden
  // Daha dar arch için: archLeft: 540, archRight: 900
  // Daha geniş arch için: archLeft: 380, archRight: 1060
  archLeft: 540,
  archRight: 900,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 3 — HERO SLIDER
// ─────────────────────────────────────────────────────────────────────────────

export const sliderTheme = {
  autoplayDelay: 5500, // ms
  speed: 800, // geçiş süresi (ms)

  /** Slider yüksekliği (px) — HeroSlider bu değerden okur */
  heightMobile: 520, // ≤ md breakpoint
  height: 600, // md+

  /** Önceki/sonraki ok butonlarının arka plan rengi */
  navBtnBg: palette.honeyDark,
  /** Önceki/sonraki ok butonlarının ikon rengi */
  navBtnColor: palette.white,

  slides: [
    {
      // badge:       "1973 KOZAN — KOOPERATİF BALI",
      // title:       "Binlerce Arının\nBinlerce Arıcının\nKusursuz Emeği",
      // subtitle:    "Şirket Değil, Kooperatif!",
      // description: "Toroslar'ın endemik çiçeklerinden süzülen, analiz sertifikalı doğal balı doğrudan arıcıdan sofranzıa taşıyoruz.",
      primaryBtn: { label: "Ürünleri Keşfet", href: "/urunlerimiz" },
      secondaryBtn: { label: "Hikayemiz", href: "/hakkimizda" },
      image: "/images/slider-images/banner1.webp" as string | undefined,
      // stats: [
      //   { value: "1800+", label: "Arıcı Üye" },
      //   { value: "50 Yıl", label: "Tecrübe" },
      //   { value: "%100",   label: "Doğal" },
      // ],
      // // Renkler
      // gradientFrom: "#7B1E00",      // honeyDark'ın daha koyusu
      // gradientTo:   palette.honeyDark,
      // textAccent:   palette.honeyBright,
      // accentLine:   palette.honeyBright,
    },
    {
      // badge:       "TOROS DAĞLARI — ENDEMİK ÇİÇEKLER",
      // title:       "Çiçek Balının\nRahatsız Edilmemiş\nHali",
      // subtitle:    "Keven • Kekik • Çalıkuşu",
      // description: "Kozan'ın vadilerinde, insanın ulaşamadığı yaylalarda üretilen çiçek balı. Her kaşıkta bin çiçeğin özü.",
      primaryBtn: {
        label: "Çiçek Balını İncele",
        href: "/urunlerimiz?tur=CICEK",
      },
      secondaryBtn: { label: "Bal Rehberi", href: "/bal-rehberi" },
      image: "/images/slider-images/banner2.webp" as string | undefined,

      // stats: [
      //   { value: "45 000",  label: "Kovan" },
      //   { value: "2 Sezon", label: "Yıllık Hasat" },
      //   { value: "0",       label: "Katkı Maddesi" },
      // ],
      // gradientFrom: "#92400E",
      // gradientTo:   "#D97706",
      // textAccent:   "#FDE68A",   // amber-200
      // accentLine:   "#FCD34D",   // amber-300
    },
    {
      // badge:       "LONDON HONEY GOLD — ÖDÜLLÜ BAL",
      // title:       "Uluslararası\nÖdüllü Kalite\nGüvencesi",
      // subtitle:    "ISO 22000 • Analiz Sertifikalı",
      // description: "Her seri üretimde bağımsız laboratuvar analizi yapılır. Ne yediğinizi bilmek hakkınız; biz de bunu şeffaflıkla sunuyoruz.",
      primaryBtn: { label: "Alışverişe Başla", href: "/urunlerimiz" },
      secondaryBtn: { label: "Hakkımızda", href: "/hakkimizda" },
      image: "/images/slider-images/banner3.webp" as string | undefined,
      // stats: [
      //   { value: "ISO",  label: "22000 Belgeli" },
      //   { value: "100%", label: "Lab Analizi" },
      //   { value: "2022", label: "London Gold" },
      // ],
      // gradientFrom: "#1A3A2A",
      // gradientTo:   "#2D5A3D",
      // textAccent:   "#BBF7D0",   // green-200
      // accentLine:   "#4ADE80",   // green-400
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 4 — BUTONLAR (globals.css .btn-* sınıflarıyla eşleşir)
// ─────────────────────────────────────────────────────────────────────────────

export const buttonTheme = {
  primary: { bg: palette.honeyDark, hover: "#9A2400", text: palette.white },
  secondary: {
    bg: palette.honey,
    hover: palette.honeyMedium,
    text: palette.white,
  },
  outline: { border: palette.honeyDark, text: palette.honeyDark },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 5 — ADMİN PANELİ
// ─────────────────────────────────────────────────────────────────────────────

export const adminTheme = {
  navActiveBg: palette.honeyCream,
  navActiveText: palette.honeyDark,
  navHoverBg: palette.honeyCream,
  navHoverText: palette.honeyDark,
  accentColor: palette.honeyDark,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 6 — TAİLWIND CONFIG EXPORT
//         tailwind.config.ts bu nesneden colors'ı okur
// ─────────────────────────────────────────────────────────────────────────────

export const tailwindColors = {
  honey: {
    dark: palette.honeyDark,
    medium: palette.honeyMedium,
    DEFAULT: palette.honey,
    bright: palette.honeyBright,
    light: palette.honeyLight,
    cream: palette.honeyCream,
  },
  primary: {
    50: palette.honeyCream,
    100: palette.honeyLight,
    200: palette.honeyBright,
    300: palette.honey,
    400: palette.honeyMedium,
    500: palette.honeyDark,
    600: "#9A2400",
    700: "#7C1C00",
    800: "#5E1400",
    900: "#3F0C00",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 7 — CSS DEĞİŞKENLERİ (globals.css :root ile senkron tutulmalı)
// ─────────────────────────────────────────────────────────────────────────────
//
//  globals.css'te şu değişkenler bu dosyayla aynı olmalıdır:
//    --honey-dark:   palette.honeyDark   (#B82C00)
//    --honey-medium: palette.honeyMedium (#D67503)
//    --honey:        palette.honey       (#F9B10B)
//    --honey-bright: palette.honeyBright (#FCD908)
//    --honey-light:  palette.honeyLight  (#FCE7A5)
//    --honey-cream:  palette.honeyCream  (#FFF8E7)
//
//  Renk değiştiğinde hem bu dosyayı hem globals.css'i güncelle.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// § 8 — YARDIMCI FONKSİYON: hex → rgba
// ─────────────────────────────────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// § 9 — GÜVEN ROZETLERİ (TrustBadges bileşeni)
// ─────────────────────────────────────────────────────────────────────────────

export const trustBadgesTheme = {
  badges: [
    {
      image: "/images/home-screen/first-infographics/1800-arici-aile.webp",
      title: "1800+ Arıcı Aile",
      description: "Kooperatifin ortaklarından üretilen bal",
    },
    {
      image: "/images/home-screen/first-infographics/guvenilir-bal.webp",
      title: "Güvenilir Bal",
      description: "Akredite laboratuvarlarda analizden geçer",
    },
    {
      image: "/images/home-screen/first-infographics/ozenli-paketleme.webp",
      title: "Özenli Paketleme",
      description: "Binboğa'nın kalite standartlarıyla ambalajlanır",
    },
    {
      image: "/images/home-screen/first-infographics/hizli-teslimat.webp",
      title: "Hızlı Teslimat",
      description: "Aynı gün kargoya verilen siparişler",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 10 — SÜREÇ AKIŞI (ProcessFlow bileşeni)
// ─────────────────────────────────────────────────────────────────────────────

export const processFlowTheme = {
  heading: "KOOPERATİF DİREK ÜRETİCİDEN ANALİZİ YAPILMIŞ BAL ALMAK DEMEK...",

  /** Bal peteği (flat-top hexagon) clip-path */
  hexagonClip: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",

  steps: [
    {
      number: 1,
      title: "ÜRETİCİ İÇİN ADİL MODEL",
      description:
        "Arıcılarımıza adil fiyat ve öncelikli gelir güvencesi sunuyoruz. Arıcılar ortaklardan oluşur, üreticilerin kooperatif ağına dahil olması ve rekabetçi fiyatlarla kazanmalarını sağlarız.",
      image:
        "/images/home-screen/second-infographics/uretici-icin-adil-model.webp",
    },
    {
      number: 2,
      title: "KALİTE İÇİN KONTROL",
      description:
        "Her parti bal, çok aşamalı kalite denetimlerinden geçer. Akredite laboratuvarlarda analizden geçer, uluslararası standartlara uygunluğu garanti eder.",
      image: "/images/home-screen/second-infographics/kalite-icin-kontrol.webp",
    },
    {
      number: 3,
      title: "TÜKETİCİ İÇİN GÜVEN",
      description:
        "Hangi bölgeden, hangi taşıyıcıyla ve ne kadar hijyenik üretildiğine dair tam bilgi. Şeffaflık ve güven, marka bağlılığını sağlar.",
      image: "/images/home-screen/second-infographics/tuketici-icin-guven.webp",
    },
    {
      number: 4,
      title: "GELECEK İÇİN SÜRDÜRÜLEBİLİRLİK",
      description:
        "Doğal arıcılık, organik üretim ve geleceğe duyarlı uygulamalarla ekoloji sistemini koruyoruz. Doğaya saygılı, biyoçeşitlilik destekleyen gelecek nesiller için dünya bırakıyoruz.",
      image:
        "/images/home-screen/second-infographics/gelecek-icin-surdurebilirlik.webp",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 11 — ANASAYFA BANNER'LARI (page.tsx Hikayemiz & Hakkımızda)
// ─────────────────────────────────────────────────────────────────────────────

export const homeBannersTheme = {
  hikayemiz: {
    image: "/images/home-screen/our-history/our-history.webp",
    heading: "HİKAYEMİZ",
    subheading: "ŞİRKET DEĞİL, KOOPERATİFİZ!",
    body: "1973 yılında, Adana'nın Kozan ilçesinde birkaç arıcı aile bir karar verdi. Tek başına ayakta kalmanın zor oldugunu biliyorlardı. Çünkü bal sadece doganın degil, sabrın da işiydi. Yagmurun erken yagması, kuraklıgın uzaması, piyasanın dengesizligi… Hepsi küçük üreticinin omzuna yük oluyordu.\n\nİşte o gün, yükü paylaşmak için bir araya geldiler. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi böyle dogdu.",
    btn: { label: "HİKAYENİN DEVAMI ▶", href: "/hakkimizda" },
  },
  hakkimizda: {
    image: "/images/home-screen/about-us/about-us.webp",
    heading: "HAKKIMIZDA",
    subheading: "ÜLKE İÇİN KOOPERATİF!",
    body: "Binboğa Kooperatifi, üreticinin emeğini koruyan ve doğal balı güvenilir biçimde sofralara ulaştıran köklü bir yapıdır. 1973'ten bu yana kooperatif gücüyle, doğallığı ve kaliteyi bir arada sunuyoruz.\n\nArıcı ailelerimizden gelen üretimi; izlenebilirlik, özenli paketleme ve sürdürülebilir kalite anlayışı ile tüketicilerimize ulaştırıyoruz.",
    btn: { label: "DEVAMINI OKU ▶", href: "/hakkimizda" },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 12 — FOOTER
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// § 13 — BAL REHBERİ SAYFASI
// ─────────────────────────────────────────────────────────────────────────────

export const balRehberiTheme = {
  banner: {
    image: "/images/bal-rehberi/bal-rehberi-banner.png",
    /** Banner yüksekliği (Tailwind arbitrary değeri veya sınıf) */
    height: "30.3rem",
    /** Görselin dikey hizalaması — objectPosition için (örn. "center 10%") */
    objectPosition: "center top",
    /** Karartma katmanı opaklığı (0–1) */
    overlayOpacity: 0,
  },
  guvenceBolumu: {
    /** Arka plan görseli opaklığı (0–1) */
    imageOpacity: 0.4,
    /** Bölüm dikey padding — Tailwind sınıfı */
    paddingY: "py-24",
  },
} as const;

export const footerTheme = {
  logo: {
    src: "/images/logo.png",
    width: 180,
    height: 90,
  },
} as const;

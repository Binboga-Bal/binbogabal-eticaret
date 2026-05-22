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
  honeyDark:   "#C57930",
  /** Orta ton — altın turuncu */
  honeyMedium: "#D67503",
  /** Ana bal sarısı */
  honey:       "#F9B10B",
  /** Parlak sarı — vurgu */
  honeyBright: "#FCD908",
  /** Açık sarı — arka plan aksan */
  honeyLight:  "#FCE7A5",
  /** Krem — çok açık arka planlar */
  honeyCream:  "#FFF8E7",

  // Nötr
  white: "#FFFFFF",
  black: "#000000",

  // Gri scala
  gray50:  "#F9FAFB",
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
  announcementBg:   palette.honeyDark,
  announcementText: palette.white,
  bg:               palette.white,

  /** Wave (arch) SVG dolgu rengi — header arka planıyla aynı */
  waveFill:        palette.white,
  /** Wave alt kenarı çizgi rengi — duyuru bandıyla eşleşir */
  waveStroke:      palette.honeyDark,
  /** Wave kenar çizgisi kalınlığı (1440-birimlik viewBox'ta) */
  waveStrokeWidth: 6,
  /** Wave kenar gölge rengi (ince, şeffaf) */
  waveShadow:      "rgba(184, 44, 0, 0.18)",

  // Boyutlar (px)
  navHeight:          82,   // nav satırının yüksekliği
  announcementHeight: 40,   // duyuru bandı yüksekliği
  waveDepth:          90,   // arch'ın en derin noktası (arttırıldı: 60→80)
  logoWidth:          230,  // logo genişliği
  logoHeight:         150,  // logo maksimum yüksekliği
  /** Logo ile wave dibinin en derin noktası arasındaki boşluk (px).
   *  Logo container'ına paddingBottom olarak uygulanır;
   *  değeri artırınca logo daha yukarı kayar. */
  logoBottomPad:       20,

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
  archLeft:  540,
  archRight: 900,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 3 — HERO SLIDER
// ─────────────────────────────────────────────────────────────────────────────

export const sliderTheme = {
  autoplayDelay: 5500,  // ms
  speed: 800,           // geçiş süresi (ms)

  /** Slider yüksekliği (px) — HeroSlider bu değerden okur */
  heightMobile: 520,    // ≤ md breakpoint
  height:       700,    // md+

  slides: [
    {
      // badge:       "1973 KOZAN — KOOPERATİF BALI",
      // title:       "Binlerce Arının\nBinlerce Arıcının\nKusursuz Emeği",
      // subtitle:    "Şirket Değil, Kooperatif!",
      // description: "Toroslar'ın endemik çiçeklerinden süzülen, analiz sertifikalı doğal balı doğrudan arıcıdan sofranzıa taşıyoruz.",
      primaryBtn:   { label: "Ürünleri Keşfet",  href: "/urunlerimiz" },
      secondaryBtn: { label: "Hikayemiz",         href: "/hakkimizda" },
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
      primaryBtn:   { label: "Çiçek Balını İncele", href: "/urunlerimiz?tur=CICEK" },
      secondaryBtn: { label: "Bal Rehberi",          href: "/bal-rehberi" },
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
      primaryBtn:   { label: "Alışverişe Başla", href: "/urunlerimiz" },
      secondaryBtn: { label: "Hakkımızda",       href: "/hakkimizda" },
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
  primary:   { bg: palette.honeyDark,   hover: "#9A2400",           text: palette.white },
  secondary: { bg: palette.honey,       hover: palette.honeyMedium, text: palette.white },
  outline:   { border: palette.honeyDark, text: palette.honeyDark  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 5 — ADMİN PANELİ
// ─────────────────────────────────────────────────────────────────────────────

export const adminTheme = {
  navActiveBg:   palette.honeyCream,
  navActiveText: palette.honeyDark,
  navHoverBg:    palette.honeyCream,
  navHoverText:  palette.honeyDark,
  accentColor:   palette.honeyDark,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// § 6 — TAİLWIND CONFIG EXPORT
//         tailwind.config.ts bu nesneden colors'ı okur
// ─────────────────────────────────────────────────────────────────────────────

export const tailwindColors = {
  honey: {
    dark:    palette.honeyDark,
    medium:  palette.honeyMedium,
    DEFAULT: palette.honey,
    bright:  palette.honeyBright,
    light:   palette.honeyLight,
    cream:   palette.honeyCream,
  },
  primary: {
    50:  palette.honeyCream,
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

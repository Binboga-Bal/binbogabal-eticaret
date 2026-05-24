"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { CartDrawer } from "../cart/CartDrawer";
import { headerTheme } from "@/lib/theme";

const navLinks = [
  { href: "/urunlerimiz",          label: "ÜRÜNLERİMİZ" },
  { href: "/kooperatif-hikayemiz", label: "KOOPERATİF HİKAYEMİZ" },
  { href: "/hakkimizda",           label: "HAKKIMIZDA" },
  { href: "/bal-rehberi",          label: "BAL REHBERİ" },
];

/*
  TASARIM MANTAĞI
  ───────────────
  Sticky kapsayıcı (duyuru + header SVG + logo) tek blok olarak yapışır.

  Header'ın beyaz arka planı düz dikdörtgen değil; SVG ile çizilmiş
  özel bir şekildir:
  ┌──────────────── TAM GENİŞLİK ────────────────┐  ← nav alanı (navHeight px)
  │  [ÜRÜNLERİMİZ]      [LOGO]    [HAK…] [BAL…]  │
  └──────────╮                    ╭───────────────┘
              ╲        🍯         ╱
               ╰──── arch ───────╯                 ← waveDepth px aşağı iner

  Logo her zaman bu arch'ın tam ortasında yer alır.
  Tüm boyut ve renk değerleri lib/theme.ts → headerTheme'den gelir.
*/

// SVG viewBox boyutları (responsive — preserveAspectRatio="none" ile tam genişliğe yayılır)
const VB_W = 1440;
const VB_H = headerTheme.navHeight + headerTheme.waveDepth;

// Beyaz header alanını dolduran kapalı SVG path
const headerPath = [
  `M 0 0`,
  `L ${VB_W} 0`,
  `L ${VB_W} ${headerTheme.navHeight}`,
  `L ${headerTheme.archRight} ${headerTheme.navHeight}`,
  // sağdan merkeze inen bezier
  `C ${headerTheme.archRight - 80} ${headerTheme.navHeight}, ${VB_W / 2 + 60} ${VB_H}, ${VB_W / 2} ${VB_H}`,
  // merkezden sola çıkan bezier
  `C ${VB_W / 2 - 60} ${VB_H}, ${headerTheme.archLeft + 80} ${headerTheme.navHeight}, ${headerTheme.archLeft} ${headerTheme.navHeight}`,
  `L 0 ${headerTheme.navHeight}`,
  `Z`,
].join(" ");

// Arch alt kenarını çizen açık path — marka rengiyle çizilir
const archBorderPath = [
  `M 0 ${headerTheme.navHeight}`,
  `L ${headerTheme.archLeft} ${headerTheme.navHeight}`,
  `C ${headerTheme.archLeft + 80} ${headerTheme.navHeight}, ${VB_W / 2 - 60} ${VB_H}, ${VB_W / 2} ${VB_H}`,
  `C ${VB_W / 2 + 60} ${VB_H}, ${headerTheme.archRight - 80} ${headerTheme.navHeight}, ${headerTheme.archRight} ${headerTheme.navHeight}`,
  `L ${VB_W} ${headerTheme.navHeight}`,
].join(" ");

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <>
      {/* ── FIXED KAPSAYICI ─────────────────────────────────────────── */}
      {/* fixed: header akıştan çıkar, içerik altından başlayabilir  */}
      <div className="fixed top-0 left-0 right-0 z-40">

        {/* Duyuru bandı — renk ve yükseklik headerTheme'den */}
        <div
          className="relative z-10 flex items-center justify-center text-xs px-4 text-center"
          style={{
            height:     headerTheme.announcementHeight,
            background: headerTheme.announcementBg,
            color:      headerTheme.announcementText,
          }}
        >
          Kooperatif Üyelerine Ücretsiz Kargo! &nbsp;|&nbsp; 0 (322) 515 89 10
        </div>

        {/* ── HEADER (SVG arka plan + nav + logo) ─────────────────────── */}
        <div
          className="relative"
          style={{ height: VB_H, overflow: "visible" }}
        >
          {/* Beyaz header şekli (SVG)
              overflow="visible" → arch tipindeki stroke viewBox sınırında kırpılmaz */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            overflow="visible"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            style={{ display: "block" }}
          >
            {/* Beyaz dolgu */}
            <path d={headerPath} fill={headerTheme.waveFill} />

            {/* Arch kenar çizgisi — marka rengi (honeyDark) ile görünür */}
            <path
              d={archBorderPath}
              fill="none"
              stroke={headerTheme.waveStroke}
              strokeWidth={headerTheme.waveStrokeWidth}
            />
          </svg>

          {/* ── NAV SATIRI ───────────────────────────────────────────── */}
          <div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center"
            style={{ height: headerTheme.navHeight }}
          >
            {/* Sol nav */}
            <nav className="hidden md:flex items-center gap-8 flex-1">
              {navLinks.slice(0, 2).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-semibold text-gray-700 hover:text-honey-dark transition-colors tracking-wider uppercase"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Orta boşluk (logo için yer) */}
            <div className="flex-shrink-0" style={{ width: headerTheme.logoWidth + 48 }} />

            {/* Sağ nav + ikonlar */}
            <div className="flex items-center gap-6 flex-1 justify-end">
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.slice(2).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm font-semibold text-gray-700 hover:text-honey-dark transition-colors tracking-wider uppercase"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-1">
                <Link
                  href="/hesabim"
                  className="p-2 text-gray-600 hover:text-honey-dark transition-colors"
                  aria-label="Hesabım"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-gray-600 hover:text-honey-dark transition-colors"
                  aria-label="Ara"
                >
                  <Search size={20} />
                </button>
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-honey-dark transition-colors"
                  aria-label="Sepet"
                >
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-honey-dark text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </button>
                <button
                  className="md:hidden p-2 text-gray-600"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Menü"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* ── LOGO ─────────────────────────────────────────────────── */}
          {/* paddingBottom = logoBottomPad → flex center, wave dibinden uzaklaşır */}
          <Link
            href="/"
            className="absolute left-1/2 z-20 focus:outline-none"
            style={{
              top: 0,
              transform: "translateX(-50%)",
              width: headerTheme.logoWidth,
              height: VB_H,
              paddingBottom: headerTheme.logoBottomPad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Anasayfa"
          >
            <Image
              src="/images/logo.png"
              alt="Binboğa Kooperatif Balı"
              width={headerTheme.logoWidth}
              height={headerTheme.logoHeight}
              className="object-contain"
              style={{ maxHeight: headerTheme.logoHeight }}
              priority
            />
          </Link>
        </div>
        {/* ─────────────────────────────────────────────────────────────── */}

        {/* Arama çubuğu */}
        {searchOpen && (
          <div className="bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-3 relative z-10">
            <div className="max-w-7xl mx-auto">
              <input
                autoFocus
                type="search"
                placeholder="Ürün ara..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey"
              />
            </div>
          </div>
        )}

        {/* Mobil nav */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 relative z-10">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold text-gray-700 hover:text-honey-dark py-2.5 border-b border-gray-50 last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      {/* ──────────────────────────────────────────────────────────────── */}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

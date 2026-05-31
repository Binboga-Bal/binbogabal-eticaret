"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { SearchOverlay } from "./SearchOverlay";
import { headerTheme, footerTheme } from "@/lib/theme";
import { useScrollPosition } from "@/hooks/useScrollPosition";

const navLinks = [
  { href: "/urunlerimiz", label: "ÜRÜNLERİMİZ" },
  { href: "/kooperatif-hikayemiz", label: "KOOPERATİF HİKAYEMİZ" },
  { href: "/hakkimizda", label: "HAKKIMIZDA" },
  { href: "/bal-rehberi", label: "BAL REHBERİ" },
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

// Desktop arch parametreleri
const DESKTOP = {
  waveDepth: headerTheme.waveDepth,
  archLeft: headerTheme.archLeft,
  archRight: headerTheme.archRight,
};
// Mobil arch parametreleri — desktop ile aynı görünüm
const MOBILE = {
  waveDepth: 45,
  archLeft: 390,
  archRight: 1050,
};

function buildPaths(
  p: { waveDepth: number; archLeft: number; archRight: number },
  ctrl: number,
  ctrlB: number,
) {
  const vbH = headerTheme.navHeight + p.waveDepth;
  const headerPath = [
    `M 0 0`,
    `L ${VB_W} 0`,
    `L ${VB_W} ${headerTheme.navHeight}`,
    `L ${p.archRight} ${headerTheme.navHeight}`,
    `C ${p.archRight - ctrl} ${headerTheme.navHeight}, ${VB_W / 2 + ctrlB} ${vbH}, ${VB_W / 2} ${vbH}`,
    `C ${VB_W / 2 - ctrlB} ${vbH}, ${p.archLeft + ctrl} ${headerTheme.navHeight}, ${p.archLeft} ${headerTheme.navHeight}`,
    `L 0 ${headerTheme.navHeight}`,
    `Z`,
  ].join(" ");
  const archBorderPath = [
    `M 0 ${headerTheme.navHeight}`,
    `L ${p.archLeft} ${headerTheme.navHeight}`,
    `C ${p.archLeft + ctrl} ${headerTheme.navHeight}, ${VB_W / 2 - ctrlB} ${vbH}, ${VB_W / 2} ${vbH}`,
    `C ${VB_W / 2 + ctrlB} ${vbH}, ${p.archRight - ctrl} ${headerTheme.navHeight}, ${p.archRight} ${headerTheme.navHeight}`,
    `L ${VB_W} ${headerTheme.navHeight}`,
  ].join(" ");
  return { headerPath, archBorderPath, vbH };
}

// Desktop: orijinal sabit değerler
const DESKTOP_PATHS = buildPaths(DESKTOP, 80, 60);
// Mobile: arch genişliğiyle orantılı → yumuşak damlacık
const MOBILE_PATHS = buildPaths(
  MOBILE,
  Math.round((MOBILE.archRight - MOBILE.archLeft) / 4),
  120,
);

export function Header({
  logoSrc = footerTheme.logo.src,
}: {
  logoSrc?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 20;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Drawer açıkken body scroll kilitle
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Escape ile drawer kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ── FIXED KAPSAYICI ─────────────────────────────────────────── */}
      {/*
        Scroll'da tüm blok (duyuru + wave + logo) translateY ile
        announcementHeight kadar yukarı kayar. Logo wave içindeki
        konumunu hiç değiştirmez.
      */}
      <div
        className="fixed top-0 left-0 right-0 z-40 transition-transform duration-300"
        style={{
          transform: isScrolled
            ? `translateY(-${headerTheme.announcementHeight}px)`
            : "translateY(0)",
          pointerEvents: "none",
          borderTop: isScrolled
            ? `${headerTheme.waveStrokeWidth}px solid ${headerTheme.waveStroke}`
            : "none",
        }}
      >
        {/* Duyuru bandı */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center text-xs px-4 text-center"
          style={{
            top: 0,
            height: headerTheme.announcementHeight,
            background: headerTheme.announcementBg,
            color: headerTheme.announcementText,
            pointerEvents: "auto",
            zIndex: 10,
          }}
        >
          Kooperatif Üyelerine Ücretsiz Kargo!&nbsp;|&nbsp;0 (322) 515 89 10
        </div>

        {/* ── HEADER (SVG arka plan + nav + logo) — hiç hareket etmez ─── */}
        {(() => {
          const paths = isMobile ? MOBILE_PATHS : DESKTOP_PATHS;
          const logoW = isMobile ? 155 : headerTheme.logoWidth;
          const logoH = isMobile ? 100 : headerTheme.logoHeight;
          return (
            <div
              className="absolute left-0 right-0"
              style={{
                top: headerTheme.announcementHeight,
                height: paths.vbH,
                overflow: "visible",
                pointerEvents: "none",
              }}
            >
              <svg
                viewBox={`0 0 ${VB_W} ${paths.vbH}`}
                overflow="visible"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                style={{ display: "block", pointerEvents: "none" }}
              >
                <path d={paths.headerPath} fill={headerTheme.waveFill} />
                <path
                  d={paths.archBorderPath}
                  fill="none"
                  stroke={headerTheme.waveStroke}
                  strokeWidth={headerTheme.waveStrokeWidth}
                />
              </svg>

              {/* ── NAV SATIRI ─────────────────────────────────────────────── */}
              <div
                className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-14 xl:px-16 3xl:px-16 flex items-center"
                style={{
                  height: headerTheme.navHeight,
                  paddingTop: 8,
                  paddingRight: "max(28px, env(safe-area-inset-right, 28px))",
                  pointerEvents: "auto",
                }}
              >
                {/* Sol — desktop: nav linkleri | mobil: hamburger + hesabım */}
                <div className="flex items-center gap-0.5 flex-1">
                  <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                    {navLinks.slice(0, 2).map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="text-xs lg:text-sm font-semibold text-gray-700 hover:text-honey-dark transition-colors tracking-wider uppercase whitespace-nowrap"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </nav>
                  {/* Hamburger — yalnızca mobil */}
                  <button
                    className="md:hidden p-2.5 text-gray-600 hover:text-honey-dark transition-colors rounded-xl"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Menüyü Aç"
                  >
                    <Menu size={22} />
                  </button>
                  <Link
                    href="/hesabim"
                    className="md:hidden p-2.5 text-gray-600 hover:text-honey-dark transition-colors rounded-xl hover:bg-honey-light/30"
                    aria-label="Hesabım"
                  >
                    <User size={20} />
                  </Link>
                </div>

                {/* Orta boşluk (logo için yer) */}
                <div
                  className="flex-shrink-0"
                  style={{ width: isMobile ? logoW + 28 : logoW + 48 }}
                />

                {/* Sağ nav + ikonlar */}
                <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end">
                  <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                    {navLinks.slice(2).map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="text-xs lg:text-sm font-semibold text-gray-700 hover:text-honey-dark transition-colors tracking-wider uppercase whitespace-nowrap"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </nav>

                  {/* İkon grubu */}
                  <div className="flex items-center gap-0.5 md:mr-0 mr-5">
                    {/* Hesabım — yalnızca desktop */}
                    <Link
                      href="/hesabim"
                      className="hidden md:flex p-2.5 text-gray-600 hover:text-honey-dark transition-colors rounded-xl hover:bg-honey-light/30"
                      aria-label="Hesabım"
                    >
                      <User size={20} />
                    </Link>
                    <button
                      onClick={() => setSearchOpen(!searchOpen)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        searchOpen
                          ? "bg-honey-light text-gray-600"
                          : "text-gray-600 hover:text-honey-dark hover:bg-honey-light/30"
                      }`}
                      aria-label="Ara"
                    >
                      <Search size={20} />
                    </button>
                    <Link
                      href="/sepet"
                      className="relative p-2.5 pr-4 md:pr-2.5 text-gray-600 hover:text-honey-dark transition-colors rounded-xl hover:bg-honey-light/30"
                      aria-label="Sepet"
                    >
                      <ShoppingCart size={20} />
                      {itemCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-honey-dark text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                          {itemCount > 9 ? "9+" : itemCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── LOGO ── SVG container içinde, top:0 → her zaman arch'ın tepesinde */}
              <Link
                href="/"
                className="absolute left-1/2 z-20 focus:outline-none"
                style={{
                  pointerEvents: "auto",
                  top: 0,
                  transform: "translateX(-50%)",
                  width: logoW,
                  height: paths.vbH,
                  paddingBottom: headerTheme.logoBottomPad,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Anasayfa"
              >
                <Image
                  src={logoSrc}
                  alt="Binboğa Kooperatif Balı"
                  width={logoW}
                  height={logoH}
                  className="object-contain"
                  style={{ maxHeight: logoH }}
                  priority
                />
              </Link>
            </div>
          );
        })()}
      </div>
      {/* ──────────────────────────────────────────────────────────────── */}

      {/* ── MOBİL DRAWER OVERLAY ───────────────────────────────────────── */}
      {/* Arka plan örtüsü */}
      <div
        aria-hidden
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300"
        style={{
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer paneli — soldan kayar */}
      <aside
        className="fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-white z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        aria-label="Gezinti menüsü"
      >
        {/* Drawer başlık */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
          style={{ background: headerTheme.announcementBg }}
        >
          <Link href="/" onClick={() => setDrawerOpen(false)}>
            <Image
              src={logoSrc}
              alt="Binboğa"
              width={100}
              height={50}
              className="object-contain h-10 w-auto"
            />
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-white/80 hover:text-white transition-colors rounded-lg"
            aria-label="Menüyü Kapat"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigasyon linkleri */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-700 hover:text-honey-dark hover:bg-honey-cream/50 transition-colors border-b border-gray-50 last:border-0"
            >
              {l.label}
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          ))}
        </nav>

        {/* Alt kısım — Hesap & Sepet */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          <Link
            href="/hesabim"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-honey-cream/50 transition-colors"
          >
            <User size={18} className="text-honey-dark" />
            Hesabım
          </Link>
          <Link
            href="/sepet"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-honey-cream/50 transition-colors"
          >
            <ShoppingCart size={18} className="text-honey-dark" />
            Sepetim
            {itemCount > 0 && (
              <span className="ml-auto bg-honey-dark text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Duyuru bandı alt */}
        <div
          className="px-5 py-3 text-xs text-center"
          style={{
            background: headerTheme.announcementBg,
            color: headerTheme.announcementText,
          }}
        >
          0 (322) 515 89 10
        </div>
      </aside>
      {/* ──────────────────────────────────────────────────────────────────── */}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

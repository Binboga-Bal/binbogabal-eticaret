"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { headerTheme, footerTheme } from "@/lib/theme";

// ─── Sabitler ───────────────────────────────────────────────────────────────


// Header'ın tam yüksekliği (duyuru + nav + wave çukuru)
const HEADER_H =
  headerTheme.announcementHeight + headerTheme.navHeight + headerTheme.waveDepth;


// ─── Tipler ─────────────────────────────────────────────────────────────────

type ProductHit = {
  id: string;
  name: string;
  slug: string;
  images: unknown;
  variants: { price: number; discountedPrice: number | null }[];
};

// ─── Yardımcı fonksiyonlar ───────────────────────────────────────────────────

function getFirstImage(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) {
    if (typeof images[0] === "string") return images[0];
    if (images[0] && typeof images[0] === "object" && "url" in images[0]) {
      return (images[0] as { url: string }).url;
    }
  }
  return footerTheme.logo.src;
}

function formatPrice(variant?: { price: number; discountedPrice: number | null }): string | null {
  if (!variant) return null;
  const p = variant.discountedPrice ?? variant.price;
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(p);
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<ProductHit[]>([]);
  const [popular, setPopular]   = useState<ProductHit[]>([]);
  const [loading, setLoading]     = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [nameIdx, setNameIdx]     = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [focused, setFocused]     = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typewriter animasyonu — popular ürün isimleriyle çalışır
  useEffect(() => {
    if (!open || query || popular.length === 0) {
      setDisplayText("");
      return;
    }
    const names = popular.map((p) => p.name);
    const current = names[nameIdx % names.length];

    if (!isDeleting) {
      if (displayText.length < current.length) {
        const t = setTimeout(
          () => setDisplayText(current.slice(0, displayText.length + 1)),
          65,
        );
        return () => clearTimeout(t);
      }
      // Tamamlandı — bekle, sonra sil
      const t = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(t);
    } else {
      if (displayText.length > 0) {
        const t = setTimeout(
          () => setDisplayText((s) => s.slice(0, -1)),
          38,
        );
        return () => clearTimeout(t);
      }
      // Silindi — sonraki isme geç
      setIsDeleting(false);
      setNameIdx((i) => (i + 1) % names.length);
    }
  }, [open, query, popular, displayText, isDeleting, nameIdx]);

  // Açılınca: input focus + popüler ürünleri çek
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setFocused(false);
      setDisplayText("");
      setNameIdx(0);
      setIsDeleting(false);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    fetch("/api/search")
      .then((r) => r.json())
      .then((d) => setPopular(d.popular ?? []))
      .catch(() => {});
    return () => clearTimeout(t);
  }, [open]);

  // Debounced arama
  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(value)}`)
        .then((r) => r.json())
        .then((d) => { setResults(d.results ?? []); setLoading(false); })
        .catch(() => setLoading(false));
    }, 350);
  }, []);

  // Escape ile kapat
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* ── Arka plan örtüsü ──────────────────────────────────────────── */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 38,
          background: "rgba(17, 12, 5, 0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* ── Kayan panel ───────────────────────────────────────────────── */}
      {/*
        overflow: visible (varsayılan) kalır — alt arch SVG'si panel'in
        dışına taşabilsin. position: fixed parent olduğu için clip-plane
        viewport'tur, panel sınırları değil.
      */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 39,
          height: `calc(50vh + ${HEADER_H}px)`,
          background: "#FDFAF5",
          transform: open ? "translateY(0)" : "translateY(-100%)",
          transition: open
            ? "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
            : "transform 0.3s cubic-bezier(0.7, 0, 0.84, 0)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* İçerik (header wave'in altından başlar) */}
        <div
          style={{
            position: "absolute",
            top: HEADER_H + 6,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: "auto",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-8">

              {/* ── SOL: Arama kutusu + sonuçlar ─────────────────────── */}
              <div className="flex-1 min-w-0">

                {/* Başlık + Kapat */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                    Ne arıyorsunuz?
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-xl px-3 py-1.5 transition-colors"
                  >
                    <X size={14} />
                    Kapat
                  </button>
                </div>

                {/* Arama kutusu */}
                <div className="relative mb-4">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: headerTheme.waveStroke }}
                  />

                  {/* Typewriter placeholder */}
                  {!query && (
                    <span
                      className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none select-none text-gray-400"
                      style={{ fontSize: 14 }}
                    >
                      <style>{`@keyframes tw-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
                      {displayText}
                      <span
                        className="inline-block w-px h-3.5 bg-gray-400 ml-px align-middle"
                        style={{ animation: "tw-blink 1s step-end infinite" }}
                      />
                    </span>
                  )}

                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder=""
                    className="w-full pl-12 pr-11 py-3 text-sm rounded-2xl border focus:outline-none transition-all duration-200"
                    style={{
                      borderColor: focused ? headerTheme.waveStroke : "#E8DFC8",
                      background: "white",
                      boxShadow: focused
                        ? `0 0 0 3px ${headerTheme.waveStroke}18`
                        : "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  />

                  {query && (
                    <button
                      onClick={() => { handleChange(""); inputRef.current?.focus(); }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Sonuç alanı */}
                {query ? (
                  loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : results.length > 0 ? (
                    <div>
                      <p className="text-[10px] text-gray-400 mb-3 tracking-widest uppercase font-medium">
                        {results.length} ürün bulundu
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {results.slice(0, 6).map((p) => (
                          <Link
                            key={p.id}
                            href={`/urunlerimiz/${p.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-100/60 hover:border-amber-300 hover:shadow-sm transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                              <Image
                                src={getFirstImage(p.images)}
                                alt={p.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-gray-700 group-hover:text-amber-900 line-clamp-2 leading-snug">
                                {p.name}
                              </p>
                              {formatPrice(p.variants[0]) && (
                                <p
                                  className="text-[11px] font-semibold mt-0.5"
                                  style={{ color: headerTheme.waveStroke }}
                                >
                                  {formatPrice(p.variants[0])}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      {results.length > 6 && (
                        <div className="mt-3 text-center">
                          <Link
                            href={`/urunlerimiz?q=${encodeURIComponent(query)}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors hover:bg-amber-50"
                            style={{ color: headerTheme.waveStroke }}
                          >
                            Tüm sonuçları gör ({results.length} ürün)
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-center">
                      <Search size={32} className="mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        &ldquo;<strong>{query}</strong>&rdquo; için sonuç bulunamadı.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Farklı bir arama terimi deneyin.</p>
                    </div>
                  )
                ) : (
                  /* Mobil: sorgu yokken popüler ürünler etiket olarak */
                  <div className="lg:hidden">
                    {popular.length > 0 && (
                      <>
                        <p
                          className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase mb-3"
                          style={{ color: headerTheme.waveStroke }}
                        >
                          <TrendingUp size={12} />
                          En Çok Arananlar
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {popular.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleChange(p.name)}
                              className="px-3 py-1.5 text-xs rounded-full border transition-colors hover:bg-amber-50"
                              style={{
                                borderColor: `${headerTheme.waveStroke}55`,
                                color: headerTheme.waveStroke,
                                background: "#FFF8E7",
                              }}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Dikey ayraç */}
              <div
                className="hidden lg:block w-px shrink-0 self-stretch"
                style={{ background: `${headerTheme.waveStroke}22` }}
              />

              {/* ── SAĞ: En Çok Arananlar (desktop) ──────────────────── */}
              <aside className="hidden lg:flex flex-col w-56 shrink-0">
                <p
                  className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase mb-2"
                  style={{ color: headerTheme.waveStroke }}
                >
                  <TrendingUp size={11} />
                  En Çok Arananlar
                </p>
                <ul className="space-y-px">
                  {popular.slice(0, 6).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/urunlerimiz/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-amber-50/80 group"
                      >
                        <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-amber-100 bg-white">
                          <Image
                            src={getFirstImage(p.images)}
                            alt={p.name}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-gray-600 group-hover:text-amber-900 truncate leading-snug">
                            {p.name}
                          </p>
                          {formatPrice(p.variants[0]) && (
                            <p
                              className="text-[11px] font-semibold leading-tight"
                              style={{ color: headerTheme.waveStroke }}
                            >
                              {formatPrice(p.variants[0])}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

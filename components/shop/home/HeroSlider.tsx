"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import Link from "next/link";
import { sliderTheme } from "@/lib/theme";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Image-only slide'larda metin/gradient alanlar zorunlu değil; hepsi optional.
// image tanımlıysa → image-only branch; değilse gradient + metin branch kullanılır.
interface Slide {
  primaryBtn: { label: string; href: string };
  secondaryBtn?: { label: string; href: string };
  image?: string;
  // --- gradient slide alanları (image yoksa kullanılır) ---
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: ReadonlyArray<{ value: string; label: string }>;
  gradientFrom?: string;
  gradientTo?: string;
  textAccent?: string;
  accentLine?: string;
}

const slides: Slide[] = sliderTheme.slides as unknown as Slide[];

export function HeroSlider() {
  // minHeight: Swiper fade modunda slides position:absolute olduğu için
  // container yüksekliği JS çalışana kadar 0 kalabilir; arch zone + içerik için yer garantile
  return (
    <div className="relative hero-slider-wrapper">
      <style>{`
        /* Slider yüksekliği — sliderTheme.heightMobile / height */
        .hero-slider-wrapper,
        .hero-slider-wrapper .swiper,
        .hero-slide-section {
          min-height: ${sliderTheme.heightMobile}px;
        }
        @media (min-width: 768px) {
          .hero-slider-wrapper,
          .hero-slider-wrapper .swiper,
          .hero-slide-section {
            min-height: ${sliderTheme.height}px;
          }
        }

        .hero-slider-wrapper,
        .hero-slider-wrapper .swiper,
        .hero-slider-wrapper .swiper-wrapper,
        .hero-slider-wrapper .swiper-slide,
        .hero-slide-section {
          border: none !important;
        }

        .hero-slider-wrapper .swiper-button-next,
        .hero-slider-wrapper .swiper-button-prev {
          color: ${sliderTheme.navBtnColor};
          background: ${sliderTheme.navBtnBg};
          width: 44px;
          height: 44px;
          border-radius: 50%;
          backdrop-filter: blur(4px);
        }
        .hero-slider-wrapper .swiper-button-next::after,
        .hero-slider-wrapper .swiper-button-prev::after {
          font-size: 16px;
          font-weight: 900;
          color: ${sliderTheme.navBtnColor};
        }
        .hero-slider-wrapper .swiper-pagination-bullet {
          background: rgba(255,255,255,0.6);
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.3s;
        }
        .hero-slider-wrapper .swiper-pagination-bullet-active {
          background: #FCD908;
          width: 24px;
          border-radius: 4px;
        }

        /* Wave SVG yüksekliği — küçük ekranda çok ince, büyük ekranda çok şişkin olmasın */
        .hero-slide-wave {
          height: 36px;
        }
        @media (min-width: 768px) {
          .hero-slide-wave {
            height: 56px;
          }
        }
      `}</style>

      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: sliderTheme.autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation
        pagination={{ clickable: true }}
        loop
        speed={sliderTheme.speed}
        className="w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <SlideContent slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  // ── IMAGE SLIDE ──────────────────────────────────────────────────────────────
  // image tanımlıysa: sadece tam ekran görsel, overlay/metin yok
  if (slide.image) {
    return (
      <section className="hero-slide-section relative overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.image}
          alt={slide.badge}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute left-0 right-0 pointer-events-none" style={{ bottom: '-2px' }}>
          <svg viewBox="0 0 1440 60" className="hero-slide-wave w-full block" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white" />
          </svg>
        </div>
      </section>
    );
  }

  // ── GRADIENT SLIDE ───────────────────────────────────────────────────────────
  // image yoksa: renkli gradient arka plan + metin içeriği
  return (
    <section
      className="hero-slide-section relative flex items-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${slide.gradientFrom} 0%, ${slide.gradientTo} 100%)`,
      }}
    >
      {/* Sol degrade overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      {/* Sağ dekoratif petek */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2/5 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #FCD908 2px, transparent 2px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Sağ dekoratif daire */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="w-64 h-64 rounded-full border-4 border-white/10" />
        <div className="absolute inset-4 rounded-full border-2 border-white/10" />
        <div className="absolute inset-8 rounded-full bg-white/5 flex items-center justify-center">
          <span className="text-6xl select-none">🍯</span>
        </div>
      </div>

      {/* İçerik — pt-24 (96 px) wave arch'ın (80 px) altında kalmasını sağlar */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="max-w-xl">

          {/* Badge */}
          <p
            className="font-bold text-xs mb-4 tracking-[0.2em] uppercase"
            style={{ color: slide.textAccent }}
          >
            {slide.badge}
          </p>

          {/* Başlık */}
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight whitespace-pre-line drop-shadow-lg mb-3">
            {slide.title}
          </h1>

          {/* Subtitle stripe */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-0.5 w-8" style={{ background: slide.accentLine }} />
            <span className="text-white/80 text-sm font-semibold">{slide.subtitle}</span>
          </div>

          {/* Açıklama */}
          <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-md">
            {slide.description}
          </p>

          {/* Butonlar */}
          <div className="flex gap-3 flex-wrap">
            <Link href={slide.primaryBtn.href} className="btn-secondary text-sm">
              {slide.primaryBtn.label}
            </Link>
            {slide.secondaryBtn && (
              <Link
                href={slide.secondaryBtn.href}
                className="inline-flex items-center gap-2 border-2 border-white/60 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white hover:text-honey-dark transition-all duration-200 text-sm"
              >
                {slide.secondaryBtn.label}
              </Link>
            )}
          </div>

          {/* İstatistikler */}
          {slide.stats && (
            <div className="mt-10 flex gap-8 flex-wrap">
              {slide.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black" style={{ color: slide.textAccent }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute left-0 right-0 pointer-events-none" style={{ bottom: '-2px' }}>
        <svg viewBox="0 0 1440 60" className="hero-slide-wave w-full block" preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

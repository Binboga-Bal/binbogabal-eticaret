"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import { sliderTheme } from "@/lib/theme";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Link from "next/link";

export interface HeroSlideData {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  altText: string | null;
}

interface HeroSliderProps {
  slides: HeroSlideData[];
}

interface SlideProps {
  slide: HeroSlideData;
  eager?: boolean;
}

export function HeroSlider({ slides }: HeroSliderProps) {
  return (
    <div className="relative hero-slider-wrapper">
      <style>{`
        /* Slider yüksekliği: genişliğe orantılı — ekran daraldıkça yükseklik de azalır,
           object-cover kırpması azalır. clamp(min, 72vw, max) */
        .hero-slider-wrapper,
        .hero-slider-wrapper .swiper,
        .hero-slide-section {
          min-height: clamp(320px, 76vw, ${sliderTheme.heightMobile}px);
        }
        @media (min-width: 768px) {
          .hero-slider-wrapper,
          .hero-slider-wrapper .swiper,
          .hero-slide-section {
            min-height: clamp(400px, 36vw, ${sliderTheme.height}px);
          }
        }
        @media (min-width: 1920px) {
          .hero-slider-wrapper,
          .hero-slider-wrapper .swiper,
          .hero-slide-section {
            min-height: clamp(580px, 32vw, ${sliderTheme.height3xl}px);
          }
        }
        @media (min-width: 2560px) {
          .hero-slider-wrapper,
          .hero-slider-wrapper .swiper,
          .hero-slide-section {
            min-height: clamp(680px, 30vw, ${sliderTheme.height4xl}px);
          }
        }

        .hero-slider-wrapper,
        .hero-slider-wrapper .swiper,
        .hero-slider-wrapper .swiper-wrapper,
        .hero-slider-wrapper .swiper-slide,
        .hero-slide-section {
          border: none !important;
        }

        /* Ok butonları — dokunmatik ekranlarda gereksiz, küçük mobilde gizlenir */
        .hero-slider-wrapper .swiper-button-next,
        .hero-slider-wrapper .swiper-button-prev {
          display: none;
        }
        @media (min-width: 768px) {
          .hero-slider-wrapper .swiper-button-next,
          .hero-slider-wrapper .swiper-button-prev {
            display: flex;
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
        }
        /* Pagination — wave'in üzerinde görünsün */
        .hero-slider-wrapper .swiper-pagination {
          bottom: 46px;
        }
        @media (min-width: 768px) {
          .hero-slider-wrapper .swiper-pagination {
            bottom: 66px;
          }
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
        loop={slides.length > 1}
        speed={sliderTheme.speed}
        className="w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.id}>
            <SlideContent slide={slide} eager={i === 0} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function SlideContent({ slide, eager }: SlideProps) {
  const inner = (
    <section className="hero-slide-section relative overflow-hidden bg-honey-cream">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.imageUrl}
        alt={slide.altText ?? ""}
        className="absolute inset-0 w-full h-full object-cover"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
      <div className="absolute left-0 right-0 pointer-events-none" style={{ bottom: "-2px" }}>
        <svg viewBox="0 0 1440 60" className="hero-slide-wave w-full block" preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white" />
        </svg>
      </div>
    </section>
  );

  if (slide.linkUrl) {
    return (
      <Link href={slide.linkUrl} className="block" tabIndex={-1}>
        {inner}
      </Link>
    );
  }
  return inner;
}

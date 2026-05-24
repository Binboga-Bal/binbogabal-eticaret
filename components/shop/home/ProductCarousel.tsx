"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ProductCard } from "@/components/shop/product/ProductCard";
import type { SerializedProduct } from "@/lib/utils/serialize";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface ProductCarouselProps {
  products: SerializedProduct[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  if (products.length === 0) return null;

  const needsLoop = products.length > 4;

  return (
    <div className="product-carousel-wrapper relative">
      <style>{`
        .product-carousel-wrapper .swiper-pagination {
          position: static;
          margin-top: 24px;
        }
        .product-carousel-wrapper .swiper-pagination-bullet {
          background: #d1d5db;
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.3s;
        }
        .product-carousel-wrapper .swiper-pagination-bullet-active {
          background: #c8860a;
          width: 24px;
          border-radius: 4px;
        }
        .product-carousel-wrapper .swiper-button-prev,
        .product-carousel-wrapper .swiper-button-next {
          color: #c8860a;
          background: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          top: 40%;
        }
        .product-carousel-wrapper .swiper-button-prev::after,
        .product-carousel-wrapper .swiper-button-next::after {
          font-size: 13px;
          font-weight: 900;
        }
        .product-carousel-wrapper .swiper-button-prev { left: -4px; }
        .product-carousel-wrapper .swiper-button-next { right: -4px; }
        .product-carousel-wrapper .swiper-button-disabled {
          opacity: 0.3;
        }
      `}</style>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={2}
        spaceBetween={12}
        loop={needsLoop}
        autoplay={
          needsLoop
            ? { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        pagination={{ clickable: true }}
        navigation
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
        className="!pb-0"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

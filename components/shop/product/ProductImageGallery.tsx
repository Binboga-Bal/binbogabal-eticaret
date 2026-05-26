"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

interface Props {
  images: string[];
  productName: string;
}

const SLOT_COUNT = 3;

export function ProductImageGallery({ images, productName }: Props) {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => images[i] ?? null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = slots[activeIndex];

  // Escape ile kapat
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  // Lightbox açıkken scroll kilitle
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  return (
    <>
      <div className="space-y-3">
        {/* Ana görsel */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-honey-cream border border-honey-light flex items-center justify-center group cursor-zoom-in"
          onClick={() => activeImage && setLightboxOpen(true)}
        >
          {activeImage ? (
            <>
              <Image
                src={activeImage}
                alt={productName}
                fill
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                <ZoomIn
                  size={40}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg"
                />
              </div>
            </>
          ) : (
            <span className="text-8xl">🍯</span>
          )}
        </div>

        {/* Küçük resimler — her zaman 3 slot */}
        <div className="flex gap-3">
          {slots.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-honey-cream ${
                i === activeIndex
                  ? "border-honey-dark shadow-sm"
                  : "border-gray-200 hover:border-honey"
              }`}
              aria-label={`Görsel ${i + 1}`}
            >
              {img ? (
                <Image
                  src={img}
                  alt={`${productName} ${i + 1}`}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-2xl opacity-40">
                  🍯
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onMouseLeave={() => setLightboxOpen(false)}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Kapat butonu */}
          <button
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="Kapat"
          >
            <X size={24} />
          </button>

          {/* Büyük görsel */}
          <div
            className="relative w-[85vw] h-[85vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage}
              alt={productName}
              fill
              className="object-contain"
              sizes="85vw"
              priority
            />
          </div>

          {/* Alt thumbnail navigasyonu */}
          {images.length > 1 && (
            <div
              className="absolute bottom-6 flex gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {slots.map((img, i) =>
                img ? (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeIndex
                        ? "border-honey scale-110"
                        : "border-white/30 opacity-60 hover:opacity-100 hover:border-white/60"
                    }`}
                  >
                    <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-contain p-1 bg-white/10" />
                  </button>
                ) : null
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

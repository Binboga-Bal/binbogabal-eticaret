"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import type { SerializedProduct, SerializedVariant } from "@/lib/utils/serialize";

interface Props {
  product: SerializedProduct;
  variant: SerializedVariant;
}

export function ProductCardActions({ product, variant }: Props) {
  const [qty, setQty] = useState(1);
  const max = variant.stock ?? 99;

  if (variant.stock === 0) {
    return (
      <button disabled className="w-full mt-3 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
        Stokta Yok
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      {/* Adet seçici */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
          disabled={qty <= 1}
        >
          <Minus size={11} />
        </button>
        <span className="text-xs font-semibold text-gray-800 select-none">{qty} Adet</span>
        <button
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
          disabled={qty >= max}
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-1.5">
        <AddToCartButton
          product={product}
          variant={variant}
          quantity={qty}
          className="flex-1 h-8 text-xs"
        />
        <a
          href={`/urunlerimiz/${product.slug}?hemenAl=1&adet=${qty}&variant=${variant.id}`}
          className="flex-1 h-8 flex items-center justify-center rounded-xl bg-honey text-white text-xs font-semibold hover:bg-honey-medium transition-colors"
        >
          Hemen Al
        </a>
      </div>
    </div>
  );
}

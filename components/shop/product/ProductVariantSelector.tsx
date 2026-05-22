"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatPrice, formatWeight, calculateDiscount } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";
import type { SerializedProduct, SerializedVariant } from "@/lib/utils/serialize";

interface Props {
  product: SerializedProduct;
  variants: SerializedVariant[];
}

export function ProductVariantSelector({ product, variants }: Props) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  if (!selected) return null;

  const discount = selected.discountedPrice
    ? calculateDiscount(selected.price, selected.discountedPrice)
    : 0;

  return (
    <div className="mt-4 space-y-5">
      {/* Fiyat */}
      <div className="flex items-end gap-3">
        {selected.discountedPrice ? (
          <>
            <span className="text-gray-400 line-through text-lg">
              {formatPrice(selected.price)}
            </span>
            <span className="text-3xl font-black text-honey-dark">
              {formatPrice(selected.discountedPrice)}
            </span>
            <Badge variant="discount">%{discount} İNDİRİM</Badge>
          </>
        ) : (
          <span className="text-3xl font-black text-honey-dark">
            {formatPrice(selected.price)}
          </span>
        )}
      </div>

      {selected.discountedPrice && (
        <p className="text-sm text-green-700 font-medium">
          {formatPrice(selected.price - selected.discountedPrice)} tasarruf ediyorsunuz
        </p>
      )}

      {/* Gram seçimi */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Gram Seçenekleri</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              disabled={v.stock === 0}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                v.id === selectedId
                  ? "border-honey-dark bg-honey-dark text-white"
                  : "border-gray-300 text-gray-700 hover:border-honey-dark"
              } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {formatWeight(v.size)}
            </button>
          ))}
        </div>
      </div>

      {/* Adet */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>
          <span className="px-5 py-2.5 font-bold text-gray-800">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(selected.stock, quantity + 1))}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-sm text-gray-500">Stok: {selected.stock} adet</span>
      </div>

      <AddToCartButton
        product={product}
        variant={selected}
        quantity={quantity}
        className="w-full py-4 text-base"
      />
    </div>
  );
}

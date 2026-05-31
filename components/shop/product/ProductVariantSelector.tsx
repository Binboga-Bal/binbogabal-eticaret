"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Zap } from "lucide-react";
import {
  formatPrice,
  formatWeight,
  calculateDiscount,
} from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";
import { useCartStore } from "@/store/cart";
import type {
  SerializedProduct,
  SerializedVariant,
} from "@/lib/utils/serialize";

interface Props {
  product: SerializedProduct;
  variants: SerializedVariant[];
}

export function ProductVariantSelector({ product, variants }: Props) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  function handleBuyNow() {
    if (!selected || selected.stock === 0) return;
    const maxQty = (selected as { maxOrderQuantity?: number | null })
      .maxOrderQuantity;
    const safeQty = maxQty ? Math.min(quantity, maxQty) : quantity;
    addItem({
      variantId: selected.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0] ?? "",
      size: selected.size,
      packagingType: selected.packagingType,
      price: selected.price,
      discountedPrice: selected.discountedPrice,
      quantity: safeQty,
    });
    router.push("/odeme");
  }

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  if (!selected) return null;

  const discount = selected.discountedPrice
    ? calculateDiscount(selected.price, selected.discountedPrice)
    : 0;

  return (
    <div className="mt-4 space-y-3">
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
          {formatPrice(selected.price - selected.discountedPrice)} tasarruf
          ediyorsunuz
        </p>
      )}

      {/* Stok kodu */}
      {selected.erpVariantCode && (
        <p className="text-sm text-gray-500">
          Stok Kodu:{" "}
          <span className="font-bold  text-gray-700">
            {selected.erpVariantCode}
          </span>
        </p>
      )}

      {/* Gram seçimi */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm font-semibold text-gray-700 shrink-0">
          Gram Seçenekleri
        </p>
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
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors active:bg-gray-200"
              aria-label="Azalt"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-[48px] text-center font-black text-gray-900 text-lg select-none">
              {quantity}
            </span>
            <button
              onClick={() => {
                const maxQty = (
                  selected as { maxOrderQuantity?: number | null }
                ).maxOrderQuantity;
                const cap = Math.min(selected.stock, maxQty ?? Infinity);
                setQuantity(Math.min(cap, quantity + 1));
              }}
              className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors active:bg-gray-200"
              aria-label="Artır"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {selected.stock} adet
            </span>{" "}
            stokta
          </p>
        </div>
        {(() => {
          const maxQty = (selected as { maxOrderQuantity?: number | null })
            .maxOrderQuantity;
          return maxQty ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Bu üründen tek siparişte en fazla <strong>{maxQty} adet</strong>{" "}
              satın alabilirsiniz.
            </p>
          ) : null;
        })()}
      </div>

      <div className="flex gap-3">
        <AddToCartButton
          product={product}
          variant={selected}
          quantity={quantity}
          className="flex-1 py-4 text-base"
        />
        <button
          onClick={handleBuyNow}
          disabled={selected.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 py-4 text-base font-bold rounded-xl bg-honey text-white hover:bg-honey-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap size={18} />
          Hemen Al
        </button>
      </div>
    </div>
  );
}

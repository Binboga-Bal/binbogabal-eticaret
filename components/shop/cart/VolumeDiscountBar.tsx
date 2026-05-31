"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Zap } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, formatWeight } from "@/lib/utils/format";

interface VolumeTier {
  minQty: number;
  discountPercent: number;
}

interface EligibleProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  variants: {
    id: string;
    size: number;
    packagingType: string;
    price: number;
    discountedPrice: number | null;
  }[];
}

interface VolumeRule {
  id: string;
  name: string;
  tiers: VolumeTier[];
  products: { product: EligibleProduct }[];
  suggestedProducts: EligibleProduct[]; // tüm ürünler modunda API'den gelir
}

export function VolumeDiscountBar() {
  const { items, addItem } = useCartStore();
  const [rules, setRules] = useState<VolumeRule[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/volume-discounts")
      .then((r) => r.json())
      .then(setRules)
      .catch(() => {});
  }, []);

  if (!rules.length) return null;

  const cartProductIds = new Set(items.map((i) => i.productId));

  function handleAdd(product: EligibleProduct) {
    const variant = product.variants[0];
    if (!variant) return;
    setAddingId(variant.id);
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0] ?? "",
      size: variant.size,
      packagingType: variant.packagingType,
      price: Number(variant.price),
      discountedPrice: variant.discountedPrice != null ? Number(variant.discountedPrice) : null,
      quantity: 1,
    });
    setTimeout(() => setAddingId(null), 600);
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => {
        const tiers = [...rule.tiers].sort((a, b) => a.minQty - b.minQty);

        const eligibleProductIds =
          rule.products.length > 0
            ? new Set(rule.products.map((p) => p.product.id))
            : null;

        const qualifyingQty = items.reduce((sum, item) => {
          if (!eligibleProductIds || eligibleProductIds.has(item.productId)) {
            return sum + item.quantity;
          }
          return sum;
        }, 0);

        const currentTier = [...tiers].reverse().find((t) => qualifyingQty >= t.minQty) ?? null;
        const nextTier = tiers.find((t) => t.minQty > qualifyingQty) ?? null;

        // Belirli ürünler seçilmişse onları, yoksa API'nin önerdiği ürünleri kullan
        const eligibleProducts: EligibleProduct[] = (
          rule.products.length > 0
            ? rule.products.map((p) => p.product)
            : (rule.suggestedProducts ?? [])
        ).filter((p) => p.variants.length > 0);

        const sortedProducts = eligibleProducts
          .filter((p) => !cartProductIds.has(p.id))
          .slice(0, 6);

        const progressPct = nextTier
          ? Math.min((qualifyingQty / nextTier.minQty) * 100, 100)
          : 100;

        return (
          <div key={rule.id} className="bg-gradient-to-br from-honey-cream to-white rounded-2xl border border-honey/20 p-5 space-y-4">
            {/* Başlık */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-honey flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{rule.name}</p>
                {nextTier ? (
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-semibold text-honey-dark">{nextTier.minQty - qualifyingQty} ürün</span> daha ekle,{" "}
                    <span className="font-semibold text-honey-dark">%{nextTier.discountPercent} indirim</span> kazan!
                  </p>
                ) : currentTier ? (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">
                    🎉 %{currentTier.discountPercent} indirim aktif!
                  </p>
                ) : null}
              </div>
            </div>

            {/* İlerleme */}
            <div className="space-y-2">
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-honey to-honey-dark rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {tiers.map((t) => (
                  <span
                    key={t.minQty}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold transition-colors ${
                      qualifyingQty >= t.minQty
                        ? "bg-honey text-white"
                        : "bg-white border border-gray-200 text-gray-500"
                    }`}
                  >
                    {t.minQty}+ ürün → %{t.discountPercent}
                  </span>
                ))}
              </div>
            </div>

            {/* Ürün kartları */}
            {sortedProducts.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">
                  {rule.products.length > 0 ? "Kapsanan Ürünler" : "Önerilen Ürünler"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {sortedProducts.map((product) => {
                    const variant = product.variants[0];
                    if (!variant) return null;
                    const unitPrice = Number(variant.discountedPrice ?? variant.price);
                    const isInCart = cartProductIds.has(product.id);

                    return (
                      <div
                        key={product.id}
                        className={`relative bg-white rounded-lg border p-2 flex flex-col gap-1 transition-all ${
                          isInCart ? "border-honey/40 ring-1 ring-honey/20" : "border-gray-100 hover:border-honey/30"
                        }`}
                      >
                        <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-50">
                          <Image
                            src={product.images?.[0] ?? "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                          {isInCart && (
                            <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-[7px] font-black leading-none">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-gray-700 leading-tight line-clamp-2 mt-1">
                          {product.name}
                        </p>
                        <span className="text-xs font-black text-honey-dark mt-auto">{formatPrice(unitPrice)}</span>
                        <button
                          onClick={() => handleAdd(product)}
                          disabled={addingId === variant.id}
                          className="absolute -top-2 -right-2 rounded-full bg-honey text-white flex items-center justify-center hover:bg-honey-dark transition-colors disabled:opacity-60 z-10 w-6 h-6 sm:w-8 sm:h-8"
                          title="Sepete Ekle"
                        >
                          <Plus size={14} strokeWidth={2.5} className="sm:hidden" />
                          <Plus size={20} strokeWidth={2.5} className="hidden sm:block" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

const SHIPPING_THRESHOLD = 1500;

export function CartPageClient() {
  const { items, removeItem, updateQuantity, subtotal, total, couponCode, couponDiscount, applyCoupon, removeCoupon } =
    useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const res = await fetch("/api/cart/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal: subtotal() }),
    });
    const data = await res.json();
    if (data.discount) {
      applyCoupon(couponInput, data.discount);
      setCouponInput("");
    } else {
      setCouponError(data.error ?? "Geçersiz kupon kodu");
    }
    setCouponLoading(false);
  }

  const shippingFee = subtotal() >= SHIPPING_THRESHOLD ? 0 : 99;
  const grandTotal = total() + shippingFee;
  const shippingProgress = Math.min((subtotal() / SHIPPING_THRESHOLD) * 100, 100);
  const remaining = SHIPPING_THRESHOLD - subtotal();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-24 h-24 rounded-full bg-honey-light flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-honey-dark" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Sepetiniz boş</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Doğal ballarımızı keşfetmek için ürünlerimize göz atın.</p>
        <Link href="/urunlerimiz">
          <Button size="lg" className="gap-2">
            Alışverişe Başla <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Sol — Ürünler */}
      <div className="lg:col-span-2 space-y-3">
        {items.map((item) => {
          const unitPrice = item.discountedPrice ?? item.price;
          const lineTotal = unitPrice * item.quantity;
          const hasDiscount = item.discountedPrice != null && item.discountedPrice < item.price;

          return (
            <div
              key={item.variantId}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5 hover:border-honey/40 hover:shadow-sm transition-all"
            >
              {/* Ürün görseli */}
              <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <Image
                  src={item.productImage || "/placeholder.jpg"}
                  alt={item.productName}
                  fill
                  className="object-contain p-2"
                />
              </div>

              {/* Detaylar */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 text-sm sm:text-base">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatWeight(item.size)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    aria-label="Kaldır"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Birim fiyat */}
                <div className="flex items-center gap-2 mt-2">
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                  )}
                  <span className="text-xs text-gray-500">Birim: {formatPrice(unitPrice)}</span>
                </div>

                {/* Miktar + toplam */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="font-black text-honey-dark text-lg">{formatPrice(lineTotal)}</span>
                </div>
              </div>
            </div>
          );
        })}

        <Link
          href="/urunlerimiz"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-honey-dark transition-colors mt-2 w-fit"
        >
          <ChevronRight size={14} className="rotate-180" />
          Alışverişe Devam Et
        </Link>
      </div>

      {/* Sağ — Özet */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28 space-y-5">
          <h2 className="font-black text-gray-900 text-lg">Sipariş Özeti</h2>

          {/* Ücretsiz kargo progress */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {shippingFee === 0 ? (
              <p className="text-sm font-semibold text-green-600">🎉 Kargonuz ücretsiz!</p>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{formatPrice(remaining)}</span> daha ekleyin, kargo bedava!
                </p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-honey to-honey-dark rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Fiyat detayları */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ara Toplam</span>
              <span className="font-medium text-gray-800">{formatPrice(subtotal())}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Kupon İndirimi</span>
                <span className="font-semibold">−{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Kargo</span>
              <span className={shippingFee === 0 ? "text-green-600 font-semibold" : "font-medium text-gray-800"}>
                {shippingFee === 0 ? "Ücretsiz" : formatPrice(shippingFee)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="font-black text-gray-900 text-base">Toplam</span>
            <span className="font-black text-honey-dark text-2xl">{formatPrice(grandTotal)}</span>
          </div>

          {/* Kupon */}
          <div>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Tag size={14} /> {couponCode}
                </span>
                <button onClick={removeCoupon} className="text-xs text-green-600 hover:text-red-500 underline transition-colors">
                  Kaldır
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full min-w-0">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Kupon kodu"
                  className="min-w-0 flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey/50 focus:border-honey"
                />
                <Button size="sm" variant="outline" loading={couponLoading} onClick={handleApplyCoupon} className="flex-shrink-0">
                  Uygula
                </Button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
          </div>

          <Link href="/odeme" className="block mt-2">
            <Button className="w-full gap-2" size="lg">
              Ödemeye Geç <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

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

  const SHIPPING_THRESHOLD = 1500;
  const shippingFee = subtotal() >= SHIPPING_THRESHOLD ? 0 : 99;
  const grandTotal = total() + shippingFee;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
        <ShoppingBag size={56} className="mb-4 text-gray-300" />
        <h2 className="text-lg font-bold mb-2">Sepetiniz boş</h2>
        <p className="text-sm mb-6">Ürünlerimizi keşfetmek için alışverişe devam edin.</p>
        <Link href="/urunlerimiz">
          <Button>Alışverişe Devam Et</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Ürünler */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
              <Image
                src={item.productImage || "/placeholder.jpg"}
                alt={item.productName}
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.productName}</h3>
              <p className="text-sm text-gray-500">{formatWeight(item.size)}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 font-bold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-honey-dark text-lg">
                    {formatPrice((item.discountedPrice ?? item.price) * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Özet */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-4">
          <h2 className="font-bold text-gray-800 text-lg">Sipariş Özeti</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="font-medium">{formatPrice(subtotal())}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Kupon İndirimi</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Kargo</span>
              <span className={shippingFee === 0 ? "text-green-600 font-medium" : "font-medium"}>
                {shippingFee === 0 ? "Ücretsiz" : formatPrice(shippingFee)}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-gray-400">
                {formatPrice(SHIPPING_THRESHOLD - subtotal())} daha ekle, kargo ücretsiz olsun!
              </p>
            )}
          </div>

          <div className="border-t pt-3 flex justify-between font-black text-lg">
            <span>Toplam</span>
            <span className="text-honey-dark">{formatPrice(grandTotal)}</span>
          </div>

          {/* Kupon */}
          <div>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 text-green-700 rounded-lg px-3 py-2 text-sm">
                <span className="flex items-center gap-1">
                  <Tag size={14} /> {couponCode}
                </span>
                <button onClick={removeCoupon} className="text-xs underline">Kaldır</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Kupon kodu"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                />
                <Button
                  size="sm"
                  variant="outline"
                  loading={couponLoading}
                  onClick={handleApplyCoupon}
                >
                  Uygula
                </Button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </div>

          <Link href="/odeme">
            <Button className="w-full" size="lg">
              Ödemeye Geç
            </Button>
          </Link>

          <Link href="/urunlerimiz">
            <Button variant="ghost" className="w-full text-sm">
              Alışverişe Devam Et
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

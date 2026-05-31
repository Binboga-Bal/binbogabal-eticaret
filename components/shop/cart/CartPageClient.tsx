"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useCampaignEvaluator } from "@/hooks/useCampaignEvaluator";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { VolumeDiscountBar } from "@/components/shop/cart/VolumeDiscountBar";

const SHIPPING_THRESHOLD = 1500;

export function CartPageClient({ bannerEnabled = false }: { bannerEnabled?: boolean }) {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    total,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    campaignResult,
    setCampaignResult,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    setBannerVisible(bannerEnabled);
    const handler = () => setBannerVisible(false);
    window.addEventListener("cart-banner-dismissed", handler);
    return () => window.removeEventListener("cart-banner-dismissed", handler);
  }, [bannerEnabled]);

  // Kampanya motoru bağlan
  useCampaignEvaluator();

  // İlk yüklemede değerlendirme çalışırken loading göster
  useEffect(() => {
    if (items.length === 0) return;
    if (!campaignResult) setEvaluating(true);
    else setEvaluating(false);
  }, [items.length, campaignResult]);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    // Kupon kodu store'a alınır; useCampaignEvaluator otomatik yeniden değerlendirir
    // Önce hızlı doğrulama yap
    const res = await fetch("/api/campaigns/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim().toUpperCase(), orderAmount: subtotal() }),
    });
    const data = await res.json();
    setCouponLoading(false);

    if (!res.ok) {
      setCouponError(data.error ?? "Geçersiz kupon kodu");
      return;
    }

    // Geçerliyse store'a yaz — evaluator yeniden tetiklenir
    applyCoupon(data.coupon.code, data.discount);
    setCouponInput("");
    setCampaignResult(null); // sıfırla, evaluator yeniden hesaplar
  }

  const campaignDiscount = campaignResult?.totalDiscount ?? 0;
  const campaignFreeShipping = campaignResult?.freeShipping ?? false;

  const shippingFee = campaignFreeShipping || subtotal() >= SHIPPING_THRESHOLD ? 0 : 99;
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
    /* pb-24: mobilde sticky bottom bar için alan */
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 lg:pb-0 ${bannerVisible ? "mt-[72px] sm:mt-6" : ""}`}>
      {/* Sol — Ürünler */}
      <div className="lg:col-span-2 space-y-3">
        <h1 className="text-fluid-xl font-black text-gray-900 mb-6">Alışveriş Sepeti</h1>
        {items.map((item) => {
          const unitPrice = item.discountedPrice ?? item.price;
          const lineTotal = unitPrice * item.quantity;
          const hasDiscount = item.discountedPrice != null && item.discountedPrice < item.price;

          return (
            <div
              key={item.variantId}
              className="bg-white rounded-xl border border-gray-100 flex gap-0 overflow-hidden hover:border-honey/40 hover:shadow-sm transition-all"
            >
              <div className="relative w-40 self-stretch flex-shrink-0 bg-gray-50 border-r border-gray-100">
                <Image
                  src={item.productImage || "/placeholder.jpg"}
                  alt={item.productName}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <div className="flex-1 min-w-0 p-4">
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

                <div className="flex items-center gap-2 mt-2">
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                  )}
                  <span className="text-xs text-gray-500">Birim: {formatPrice(unitPrice)}</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-7 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={11} />
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

        {/* Hacim indirimi çubuğu */}
        <VolumeDiscountBar />
      </div>

      {/* Sağ — Özet (desktop) */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 sticky" style={{ top: bannerVisible ? 200 : 110 }}>
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

          {/* Kampanya mesajları */}
          {evaluating && items.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              İndirimler hesaplanıyor...
            </div>
          )}

          {campaignResult && campaignResult.appliedCampaigns.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Uygulanan İndirimler</p>
              {campaignResult.appliedCampaigns.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">{c.campaignName}</p>
                    {c.message && <p className="text-xs text-green-600 mt-0.5">{c.message}</p>}
                  </div>
                  {c.discountAmount > 0 && (
                    <span className="text-sm font-bold text-green-700 flex-shrink-0">
                      -{formatPrice(c.discountAmount)}
                    </span>
                  )}
                  {c.freeShipping && !c.discountAmount && (
                    <span className="text-xs font-bold text-green-700 flex-shrink-0">Ücretsiz kargo</span>
                  )}
                </div>
              ))}
              {campaignResult.giftProducts.length > 0 && (
                <div className="pt-1 border-t border-green-200 space-y-0.5">
                  {campaignResult.giftProducts.map((g, i) => (
                    <p key={i} className="text-xs text-green-700">🎁 {g.quantity}x {g.name} hediye eklendi</p>
                  ))}
                </div>
              )}
              {campaignResult.cashbackPoints > 0 && (
                <p className="text-xs text-green-700">⭐ +{campaignResult.cashbackPoints} puan kazanacaksınız</p>
              )}
            </div>
          )}

          {/* Fiyat detayları */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ara Toplam</span>
              <span className="font-medium text-gray-800">{formatPrice(subtotal())}</span>
            </div>
            {campaignDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Kampanya İndirimi</span>
                <span className="font-semibold">−{formatPrice(campaignDiscount)}</span>
              </div>
            )}
            {/* Eski kupon sistemi geri dönüş (campaign sonucu yoksa) */}
            {!campaignResult && couponDiscount > 0 && (
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

          {/* Kupon girişi */}
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
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Kupon kodu"
                  className="min-w-0 flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey/50 focus:border-honey font-mono"
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

      {/* ── MOBİL STICKY BOTTOM BAR ────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Toplam</p>
            <p className="text-xl font-black text-honey-dark">{formatPrice(grandTotal)}</p>
            {campaignDiscount > 0 && (
              <p className="text-[10px] text-green-600 font-medium">−{formatPrice(campaignDiscount)} kampanya indirimi</p>
            )}
            {shippingFee === 0 && (
              <p className="text-[10px] text-green-600 font-medium">Kargo ücretsiz</p>
            )}
          </div>
          <Link href="/odeme" className="flex-1 max-w-[200px]">
            <Button className="w-full gap-2" size="lg">
              Ödemeye Geç <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

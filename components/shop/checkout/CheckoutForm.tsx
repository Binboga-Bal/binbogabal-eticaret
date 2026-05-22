"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
// Image intentionally removed — use emoji/CSS placeholders for cart thumbnails

const schema = z.object({
  firstName: z.string().min(2, "Ad gerekli"),
  lastName: z.string().min(2, "Soyad gerekli"),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().min(10, "Telefon numarası gerekli"),
  city: z.string().min(2, "Şehir gerekli"),
  district: z.string().min(2, "İlçe gerekli"),
  fullAddress: z.string().min(10, "Adres gerekli"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { items, subtotal, total, couponCode, couponDiscount } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const SHIPPING_FEE = subtotal() >= 1500 ? 0 : 99;
  const grandTotal = total() + SHIPPING_FEE;

  async function onSubmit(data: FormValues) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingAddress: data,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.discountedPrice ?? i.price,
          productName: i.productName,
          variantInfo: `${formatWeight(i.size)} - ${i.packagingType}`,
        })),
        subtotal: subtotal(),
        shippingFee: SHIPPING_FEE,
        discount: couponDiscount,
        total: grandTotal,
        couponCode,
        notes: data.notes,
      }),
    });

    const result = await res.json();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Sepetiniz boş. Alışverişe devam edin.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-5">Teslimat Bilgileri</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Ad" {...register("firstName")} error={errors.firstName?.message} />
              <Input label="Soyad" {...register("lastName")} error={errors.lastName?.message} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="E-posta" type="email" {...register("email")} error={errors.email?.message} />
              <Input label="Telefon" type="tel" {...register("phone")} error={errors.phone?.message} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="Şehir" {...register("city")} error={errors.city?.message} />
              <Input label="İlçe" {...register("district")} error={errors.district?.message} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <textarea
                {...register("fullAddress")}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                placeholder="Mahalle, cadde, sokak, kapı no..."
              />
              {errors.fullAddress && <p className="text-xs text-red-500">{errors.fullAddress.message}</p>}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Notu (Opsiyonel)</label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
              />
            </div>
          </div>

          {/* Ödeme yöntemi */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Ödeme Yöntemi</h2>
            <div className="flex items-center gap-3 p-4 border-2 border-honey-dark rounded-xl bg-honey-cream">
              <div className="w-4 h-4 rounded-full bg-honey-dark" />
              <span className="text-sm font-semibold text-gray-800">Kredi / Banka Kartı (QNB Pay)</span>
              <div className="ml-auto flex gap-2">
                <div className="text-xs font-bold text-gray-400">VISA</div>
                <div className="text-xs font-bold text-gray-400">MC</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Ödemeniz QNB Pay güvenli altyapısı üzerinden gerçekleştirilecektir.
            </p>
          </div>
        </div>

        {/* Sipariş özeti */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-4">
            <h2 className="font-bold text-gray-800">Sipariş Özeti</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-honey-cream flex items-center justify-center text-xl">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                    ) : "🍯"}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-500">{formatWeight(item.size)} × {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-honey-dark whitespace-nowrap">
                    {formatPrice((item.discountedPrice ?? item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span>{SHIPPING_FEE === 0 ? "Ücretsiz" : formatPrice(SHIPPING_FEE)}</span>
              </div>
              <div className="flex justify-between font-black text-lg border-t pt-2">
                <span>Toplam</span>
                <span className="text-honey-dark">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Ödemeyi Tamamla
            </Button>

            <p className="text-xs text-center text-gray-400">
              🔒 256-bit SSL şifreleme ile güvende
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

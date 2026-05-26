"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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

interface CardFields {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
}

export function CheckoutForm({ codEnabled = false }: { codEnabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "QNB_PAY" | "CASH_ON_DELIVERY"
  >("QNB_PAY");
  const [card, setCard] = useState<CardFields>({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    installments: 1,
  });
  const { items, subtotal, total, couponCode, couponDiscount, clearCart } =
    useCartStore();

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

    try {
      // ----------------------------------------------------------------
      // SENARYO A: KAPIDA ÖDEME (Normal Akış)
      // ----------------------------------------------------------------
      if (paymentMethod === "CASH_ON_DELIVERY") {
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
            paymentMethod,
          }),
        });

        const result = await res.json();
        if (result.error) throw new Error(result.error);

        clearCart();
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
        return;
      }

      // ----------------------------------------------------------------
      // SENARYO B: QNB PAY İLE ÖDEME (Güvenli PCI-DSS Akışı)
      // ----------------------------------------------------------------

      // 1. ADIM: Kart bilgileri OLMADAN backend'de siparişi başlat ve QNB Hash/Token verilerini üretmesini iste.
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
          paymentMethod,
          // 🚨 DIKKAT: card objesini backend'e GÖNDERMİYORUZ! Sunucu kartı hiç görmüyor.
        }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Backend'in bize QNB Pay endpoint'i için hazırladığı parametrelerin (hash_key, app_id, invoice_id vb.) geldiğinden emin oluyoruz
      if (!result.qnbParameters) {
        throw new Error("Ödeme parametreleri bankadan alınamadı.");
      }

      // 2. ADIM: DOM üzerinde gizli bir form oluşturup kart bilgileriyle birlikte DOĞRUDAN QNB'ye POST ediyoruz.
      const form = document.createElement("form");
      form.method = "POST";
      // QNB Pay 3D Secure API endpoint'i (Backend'den dinamik gelebilir veya hardcoded eklenebilir)
      form.action =
        result.qnbParameters.api_url ||
        "https://vpos.qnb.com.tr/ccpayment/api/paySmart3D";

      // Bankanın beklediği tüm parametreleri ve local state'teki kart verilerini birleştiriyoruz
      const qnbFormFields: Record<string, string> = {
        app_id: result.qnbParameters.app_id,
        amount: grandTotal.toString(),
        hash_key: result.qnbParameters.hash_key,
        invoice_id: result.qnbParameters.invoice_id,
        callback_url: window.location.origin + "/api/payment/qnb/callback",

        // Kart Bilgileri (Doğrudan tarayıcı belleğinden bankaya gidiyor, senin sunucuna uğramıyor)
        pan: card.number.replace(/\s/g, ""), // Boşlukları temizle
        expiry: `${card.expiryMonth.padStart(2, "0")}${card.expiryYear.replace(/\D/g, "")}`, // AAYY Formatı
        cv2: card.cvv,
        installments: card.installments.toString(),
        card_holder_name: card.holderName,
      };

      // Hidden inputları oluşturup forma append ediyoruz
      Object.entries(qnbFormFields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      clearCart(); // Form submit olmadan önce sepeti temizliyoruz

      // 🚀 Tarayıcı verileri doğrudan QNB sunucularına post eder ve 3D sayfasına yönlenir.
      form.submit();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
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
        {/* Sol: Teslimat + Ödeme yöntemi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teslimat bilgileri */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-5">Teslimat Bilgileri</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ad"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="Soyad"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="E-posta"
                type="email"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Telefon"
                type="tel"
                {...register("phone")}
                error={errors.phone?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Şehir"
                {...register("city")}
                error={errors.city?.message}
              />
              <Input
                label="İlçe"
                {...register("district")}
                error={errors.district?.message}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <textarea
                {...register("fullAddress")}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                placeholder="Mahalle, cadde, sokak, kapı no..."
              />
              {errors.fullAddress && (
                <p className="text-xs text-red-500">
                  {errors.fullAddress.message}
                </p>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sipariş Notu (Opsiyonel)
              </label>
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
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("QNB_PAY")}
                className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-colors ${
                  paymentMethod === "QNB_PAY"
                    ? "border-honey-dark bg-honey-cream"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    paymentMethod === "QNB_PAY"
                      ? "border-honey-dark bg-honey-dark"
                      : "border-gray-300"
                  }`}
                />
                <div className="text-left">
                  <span className="text-sm font-semibold text-gray-800 block">
                    Kredi / Banka Kartı
                  </span>
                  <span className="text-xs text-gray-400">
                    Kart bilgileriniz doğrudan bankanın altyapısı ile güvenli
                    şekilde işlenir
                  </span>
                </div>
                <div className="ml-auto flex gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">VISA</span>
                  <span className="text-xs font-bold text-gray-400">MC</span>
                  <span className="text-xs font-bold text-gray-400">TROY</span>
                </div>
              </button>

              {codEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-colors ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-honey-dark bg-honey-cream"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "border-honey-dark bg-honey-dark"
                        : "border-gray-300"
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    Kapıda Ödeme
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    Nakit / Kart
                  </span>
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              {paymentMethod === "CASH_ON_DELIVERY"
                ? "Siparişiniz kapınıza geldiğinde nakit veya kartla ödeme yapabilirsiniz."
                : "Ödemeniz 3D Secure güvencesiyle doğrudan banka tarafında doğrulanacaktır."}
            </p>
          </div>

          {/* Kart bilgileri — sadece QNB_PAY seçiliyken */}
          {paymentMethod === "QNB_PAY" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-5">Kart Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kart Üzerindeki Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={card.holderName}
                    onChange={(e) =>
                      setCard((c) => ({
                        ...c,
                        holderName: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="AD SOYAD"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kart Numarası
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={card.number}
                    onChange={(e) => {
                      const v = e.target.value
                        .replace(/\D/g, "")
                        .substring(0, 16);
                      const formatted = v.replace(/(.{4})/g, "$1 ").trim();
                      setCard((c) => ({ ...c, number: formatted }));
                    }}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ay
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={card.expiryMonth}
                      onChange={(e) =>
                        setCard((c) => ({
                          ...c,
                          expiryMonth: e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 2),
                        }))
                      }
                      placeholder="AA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yıl
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={card.expiryYear}
                      onChange={(e) =>
                        setCard((c) => ({
                          ...c,
                          expiryYear: e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 2),
                        }))
                      }
                      placeholder="YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={card.cvv}
                      onChange={(e) =>
                        setCard((c) => ({
                          ...c,
                          cvv: e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 4),
                        }))
                      }
                      placeholder="***"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taksit
                  </label>
                  <select
                    value={card.installments}
                    onChange={(e) =>
                      setCard((c) => ({
                        ...c,
                        installments: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                  >
                    <option value={1}>Tek Çekim</option>
                    <option value={2}>2 Taksit</option>
                    <option value={3}>3 Taksit</option>
                    <option value={6}>6 Taksit</option>
                    <option value={9}>9 Taksit</option>
                    <option value={12}>12 Taksit</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Sipariş özeti */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-4">
            <h2 className="font-bold text-gray-800">Sipariş Özeti</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-honey-cream flex items-center justify-center text-xl">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      "🍯"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatWeight(item.size)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-honey-dark whitespace-nowrap">
                    {formatPrice(
                      (item.discountedPrice ?? item.price) * item.quantity,
                    )}
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
                <span>
                  {SHIPPING_FEE === 0 ? "Ücretsiz" : formatPrice(SHIPPING_FEE)}
                </span>
              </div>
              <div className="flex justify-between font-black text-lg border-t pt-2">
                <span>Toplam</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {paymentMethod === "CASH_ON_DELIVERY"
                ? "Siparişi Tamamla"
                : "Güvenli Ödeme Yap"}
            </Button>

            <p className="text-xs text-center text-gray-400">
              {paymentMethod === "CASH_ON_DELIVERY"
                ? "Ödemenizi teslimat sırasında yapabilirsiniz."
                : "🔒 Banka Güvenli Ödeme Sayfası — Kart bilgileriniz sitemizde kaydedilmez/işlenmez."}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

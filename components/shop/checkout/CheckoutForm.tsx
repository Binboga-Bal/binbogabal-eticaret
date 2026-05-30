"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Smart3DFormPayload } from "@/lib/payment/types";

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

type CardData = {
  cc_holder_name: string;
  cc_no: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
};

function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, "")
    .substring(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function validateCard(card: CardData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!card.cc_holder_name.trim())
    errors.cc_holder_name = "Kart üzerindeki isim gerekli";
  if (!/^\d{13,19}$/.test(card.cc_no.replace(/\s/g, "")))
    errors.cc_no = "Geçerli bir kart numarası girin";
  if (!/^(0[1-9]|1[0-2])$/.test(card.expiry_month))
    errors.expiry_month = "01–12 arası ay girin";
  if (!/^\d{2,4}$/.test(card.expiry_year))
    errors.expiry_year = "Geçerli yıl (YY)";
  if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = "3 veya 4 haneli CVV";
  return errors;
}

// 🔒 Kart verisi sunucuya hiç gitmez — doğrudan QNBPay'e form POST edilir
function submitToQNBPay(payload: Smart3DFormPayload, card: CardData) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payload.endpoint;
  form.style.display = "none";

  const fields: Record<string, string> = {
    authorization: payload.authorization,
    merchant_key: payload.merchant_key,
    ...(payload.pos_id ? { pos_id: payload.pos_id } : {}),
    currency_code: payload.currency_code,
    installments_number: payload.installments_number,
    invoice_id: payload.invoice_id,
    invoice_description: payload.invoice_description,
    name: payload.name,
    surname: payload.surname,
    total: payload.total,
    items: payload.items,
    ip: payload.ip,
    transaction_type: payload.transaction_type,
    is_comission_from_user: payload.is_comission_from_user,
    response_method: payload.response_method,
    return_url: payload.return_url,
    cancel_url: payload.cancel_url,
    hash_key: payload.hash_key,
    // Kart alanları — yalnızca browser'da yaşar, sunucuya uğramaz
    cc_holder_name: card.cc_holder_name,
    cc_no: card.cc_no.replace(/\s/g, ""),
    expiry_month: card.expiry_month,
    expiry_year: card.expiry_year,
    cvv: card.cvv,
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

interface SavedAddress {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
  isDefault: boolean;
}

export function CheckoutForm({
  codEnabled = false,
  savedAddresses = [],
  userEmail = "",
}: {
  codEnabled?: boolean;
  savedAddresses?: SavedAddress[];
  userEmail?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id ?? null
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "QNB_PAY" | "CASH_ON_DELIVERY"
  >("QNB_PAY");

  const [card, setCard] = useState<CardData>({
    cc_holder_name: "",
    cc_no: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const { items, subtotal, total, couponCode, couponDiscount, clearCart } =
    useCartStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Seçili adres değişince formu doldur
  function applyAddress(addressId: string | null) {
    setSelectedAddressId(addressId);
    if (!addressId) return;
    const addr = savedAddresses.find((a) => a.id === addressId);
    if (!addr) return;
    setValue("firstName", addr.firstName);
    setValue("lastName", addr.lastName);
    setValue("phone", addr.phone);
    setValue("city", addr.city);
    setValue("district", addr.district);
    setValue("fullAddress", addr.fullAddress);
    if (userEmail) setValue("email", userEmail);
  }

  // İlk yüklemede varsayılan adres varsa uygula
  useEffect(() => {
    if (selectedAddressId) applyAddress(selectedAddressId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SHIPPING_FEE = subtotal() >= 1500 ? 0 : 99;
  const grandTotal = total() + SHIPPING_FEE;

  function updateCard(field: keyof CardData, value: string) {
    setCard((prev) => ({ ...prev, [field]: value }));
    if (cardErrors[field]) {
      setCardErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function onSubmit(data: FormValues) {
    if (paymentMethod === "QNB_PAY") {
      const errs = validateCard(card);
      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🔒 Kart verisi bu body'de YOK — sunucu asla kart görmez
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

      if (result.formPayload) {
        // Browser doğrudan QNBPay'e POST eder — kart verisi sunucuya uğramaz
        submitToQNBPay(result.formPayload as Smart3DFormPayload, card);
        return;
      }

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
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

  const inputCls =
    "w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kayıtlı Adresler */}
          {savedAddresses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">Kayıtlı Adreslerim</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applyAddress(addr.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-honey-dark bg-honey-cream"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-800">{addr.title}</p>
                      {addr.isDefault && (
                        <span className="text-xs bg-honey-light text-honey-dark px-2 py-0.5 rounded-full font-semibold">
                          Varsayılan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{addr.firstName} {addr.lastName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{addr.fullAddress}</p>
                    <p className="text-xs text-gray-500">{addr.district}, {addr.city}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId(null);
                    (["firstName","lastName","phone","city","district","fullAddress"] as const).forEach(
                      (f) => setValue(f, "")
                    );
                  }}
                  className={`text-left p-4 rounded-xl border-2 border-dashed transition-colors ${
                    selectedAddressId === null
                      ? "border-honey-dark bg-honey-cream"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-600">+ Yeni Adres Gir</p>
                  <p className="text-xs text-gray-400 mt-1">Farklı bir adrese gönder</p>
                </button>
              </div>
            </div>
          )}

          {/* Teslimat Bilgileri */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-5">
              {savedAddresses.length > 0 ? "Teslimat Detayları" : "Teslimat Bilgileri"}
            </h2>

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
                className={inputCls}
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
                className={inputCls}
              />
            </div>
          </div>

          {/* Ödeme Yöntemi */}
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
                    3D Secure ile güvenli ödeme
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
          </div>

          {/* Kart Bilgileri — yalnızca QNB_PAY seçiliyken gösterilir */}
          {paymentMethod === "QNB_PAY" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-2">Kart Bilgileri</h2>
              <p className="text-xs text-gray-500 mb-5">
                Kart bilgileriniz tarayıcınızdan doğrudan bankaya şifreli olarak
                iletilir. Sistemimizde işlenmez veya saklanmaz.
              </p>

              {/* Kart üzerindeki isim */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Üzerindeki İsim
                </label>
                <input
                  type="text"
                  autoComplete="cc-name"
                  value={card.cc_holder_name}
                  onChange={(e) =>
                    updateCard(
                      "cc_holder_name",
                      e.target.value.toUpperCase(),
                    )
                  }
                  className={inputCls}
                  placeholder="AD SOYAD"
                />
                {cardErrors.cc_holder_name && (
                  <p className="text-xs text-red-500 mt-1">
                    {cardErrors.cc_holder_name}
                  </p>
                )}
              </div>

              {/* Kart numarası */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Numarası
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={card.cc_no}
                  onChange={(e) =>
                    updateCard("cc_no", formatCardNumber(e.target.value))
                  }
                  className={`${inputCls} font-mono tracking-widest`}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
                {cardErrors.cc_no && (
                  <p className="text-xs text-red-500 mt-1">
                    {cardErrors.cc_no}
                  </p>
                )}
              </div>

              {/* Son kullanma tarihi + CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ay
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp-month"
                    maxLength={2}
                    value={card.expiry_month}
                    onChange={(e) =>
                      updateCard(
                        "expiry_month",
                        e.target.value.replace(/\D/g, "").substring(0, 2),
                      )
                    }
                    className={inputCls}
                    placeholder="MM"
                  />
                  {cardErrors.expiry_month && (
                    <p className="text-xs text-red-500 mt-1">
                      {cardErrors.expiry_month}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yıl
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp-year"
                    maxLength={2}
                    value={card.expiry_year}
                    onChange={(e) =>
                      updateCard(
                        "expiry_year",
                        e.target.value.replace(/\D/g, "").substring(0, 2),
                      )
                    }
                    className={inputCls}
                    placeholder="YY"
                  />
                  {cardErrors.expiry_year && (
                    <p className="text-xs text-red-500 mt-1">
                      {cardErrors.expiry_year}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) =>
                      updateCard(
                        "cvv",
                        e.target.value.replace(/\D/g, "").substring(0, 4),
                      )
                    }
                    className={inputCls}
                    placeholder="•••"
                  />
                  {cardErrors.cvv && (
                    <p className="text-xs text-red-500 mt-1">
                      {cardErrors.cvv}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sağ Panel: Sipariş Özeti */}
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
                : "Ödemeyi Tamamla"}
            </Button>

            <p className="text-xs text-center text-gray-400">
              {paymentMethod === "CASH_ON_DELIVERY"
                ? "Ödemenizi teslimat sırasında yapabilirsiniz."
                : "Kart bilgileriniz 256-bit SSL ile doğrudan bankaya iletilir."}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

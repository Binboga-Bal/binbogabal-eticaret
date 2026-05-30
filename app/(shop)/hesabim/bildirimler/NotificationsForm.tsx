"use client";

import { useState } from "react";

interface Prefs {
  orderUpdates: boolean;
  favoriteDiscounts: boolean;
  couponReminders: boolean;
  reviewRequests: boolean;
  newsletter: boolean;
  smsNotifications: boolean;
}

const ITEMS: { key: keyof Prefs; label: string; description: string }[] = [
  { key: "orderUpdates", label: "Sipariş Güncellemeleri", description: "Sipariş durumu değişikliklerinde bildirim alın" },
  { key: "favoriteDiscounts", label: "Favori Ürün İndirimleri", description: "Favorilediğiniz ürünler indirime girince bildirim alın" },
  { key: "couponReminders", label: "Kupon Hatırlatmaları", description: "Süresi dolan kuponlar için hatırlatma alın" },
  { key: "reviewRequests", label: "Yorum İstekleri", description: "Teslim edilen siparişler için yorum daveti alın" },
  { key: "newsletter", label: "Bülten", description: "Kampanya ve yeniliklerden haberdar olun" },
  { key: "smsNotifications", label: "SMS Bildirimleri", description: "Önemli güncellemeler için SMS alın" },
];

export function NotificationsForm({ defaultValues }: { defaultValues?: Partial<Prefs> }) {
  const [prefs, setPrefs] = useState<Prefs>({
    orderUpdates: defaultValues?.orderUpdates ?? true,
    favoriteDiscounts: defaultValues?.favoriteDiscounts ?? true,
    couponReminders: defaultValues?.couponReminders ?? true,
    reviewRequests: defaultValues?.reviewRequests ?? true,
    newsletter: defaultValues?.newsletter ?? false,
    smsNotifications: defaultValues?.smsNotifications ?? false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch("/api/customer/notifications/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg space-y-4">
      {ITEMS.map((item) => (
        <label key={item.key} className="flex items-start justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-gray-800">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
          </div>
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={prefs[item.key]}
              onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
              className="w-4 h-4 accent-honey rounded"
            />
          </div>
        </label>
      ))}
      {saved && <p className="text-sm text-green-600 font-semibold">Tercihler kaydedildi!</p>}
      <button onClick={handleSave} disabled={loading} className="btn-primary text-sm">
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}

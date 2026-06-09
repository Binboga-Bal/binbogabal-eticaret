"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCookieConsent } from "@/store/cookieConsent";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={disabled ? undefined : onChange}
      className={[
        "relative shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey",
        checked ? "bg-honey-dark" : "bg-gray-200",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export function CookieConsentBanner() {
  const {
    hasResponded,
    analytics,
    marketing,
    settingsOpen,
    acceptAll,
    rejectAll,
    setConsent,
    openSettings,
    closeSettings,
  } = useCookieConsent();

  const [mounted, setMounted] = useState(false);
  const [localAnalytics, setLocalAnalytics] = useState(false);
  const [localMarketing, setLocalMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (settingsOpen) {
      setLocalAnalytics(analytics);
      setLocalMarketing(marketing);
    }
  }, [settingsOpen, analytics, marketing]);

  if (!mounted) return null;

  function handleSave() {
    const revoking =
      (analytics && !localAnalytics) || (marketing && !localMarketing);
    setConsent({ analytics: localAnalytics, marketing: localMarketing });
    closeSettings();
    // İzin iptal edilince mevcut script'lerin temizlenmesi için sayfa yenilenir
    if (revoking) window.location.reload();
  }

  function handleAcceptAll() {
    acceptAll();
    closeSettings();
  }

  return (
    <>
      {/* ── Banner (ilk ziyaret) ── */}
      {!hasResponded && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-5 animate-slide-up">
          <div className="max-w-4xl mx-auto bg-white border border-honey-light rounded-2xl shadow-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  Bu site çerezler kullanmaktadır
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Sitemizi geliştirmek için analitik, kişiselleştirilmiş
                  reklamlar için pazarlama çerezleri kullanıyoruz. Zorunlu
                  çerezler her zaman aktiftir.{" "}
                  <button
                    onClick={openSettings}
                    className="text-honey-dark underline underline-offset-2 hover:text-honey transition-colors"
                  >
                    Tercihleri özelleştir
                  </button>
                </p>
              </div>
              <div className="flex flex-row gap-2 shrink-0">
                <button
                  onClick={rejectAll}
                  className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Yalnızca Zorunlu
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-honey-dark rounded-lg hover:bg-honey-medium transition-colors whitespace-nowrap"
                >
                  Tümünü Kabul Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tercih Modalı ── */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSettings}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Başlık */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Çerez Tercihleri
              </h2>
              <button
                onClick={closeSettings}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Kategoriler */}
            <div className="divide-y divide-gray-100">
              {/* Zorunlu */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Zorunlu Çerezler
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Giriş, sepet ve güvenlik. Sitenin çalışması için şarttır.
                  </p>
                </div>
                <Toggle checked disabled />
              </div>

              {/* Analitik */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Analitik Çerezler
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Google Analytics 4 ve Microsoft Clarity — anonim ziyaret
                    istatistikleri ve kullanıcı davranışı analizi.
                  </p>
                </div>
                <Toggle
                  checked={localAnalytics}
                  onChange={() => setLocalAnalytics((v) => !v)}
                />
              </div>

              {/* Pazarlama */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Pazarlama Çerezleri
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Meta Pixel, Google Ads ve TikTok Pixel — ilgi alanlarınıza
                    göre kişiselleştirilmiş reklamlar.
                  </p>
                </div>
                <Toggle
                  checked={localMarketing}
                  onChange={() => setLocalMarketing((v) => !v)}
                />
              </div>
            </div>

            {/* Alt butonlar */}
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-3 py-2 text-xs font-medium text-honey-dark border border-honey-light rounded-lg hover:bg-honey-cream transition-colors"
              >
                Tümünü Kabul Et
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-honey-dark rounded-lg hover:bg-honey-medium transition-colors"
              >
                Tercihleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

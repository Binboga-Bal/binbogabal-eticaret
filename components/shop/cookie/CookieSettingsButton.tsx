"use client";

import { useCookieConsent } from "@/store/cookieConsent";

export function CookieSettingsButton() {
  const { openSettings } = useCookieConsent();
  return (
    <button
      onClick={openSettings}
      className="text-sm text-gray-600 hover:text-honey-dark transition-colors text-left"
    >
      Çerez Tercihleri
    </button>
  );
}

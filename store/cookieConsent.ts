import { create } from "zustand";
import { persist } from "zustand/middleware";

type CookieConsentStore = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  hasResponded: boolean;
  consentedAt: string | null;
  settingsOpen: boolean;

  acceptAll: () => void;
  rejectAll: () => void;
  setConsent: (prefs: { analytics: boolean; marketing: boolean }) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

export const useCookieConsent = create<CookieConsentStore>()(
  persist(
    (set) => ({
      necessary: true,
      analytics: false,
      marketing: false,
      hasResponded: false,
      consentedAt: null,
      settingsOpen: false,

      acceptAll: () =>
        set({
          analytics: true,
          marketing: true,
          hasResponded: true,
          consentedAt: new Date().toISOString(),
        }),

      rejectAll: () =>
        set({
          analytics: false,
          marketing: false,
          hasResponded: true,
          consentedAt: new Date().toISOString(),
        }),

      setConsent: ({ analytics, marketing }) =>
        set({
          analytics,
          marketing,
          hasResponded: true,
          consentedAt: new Date().toISOString(),
        }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
    }),
    {
      name: "binbogabal-cookie-consent",
      version: 1,
      partialize: (s) => ({
        analytics: s.analytics,
        marketing: s.marketing,
        hasResponded: s.hasResponded,
        consentedAt: s.consentedAt,
      }),
    }
  )
);

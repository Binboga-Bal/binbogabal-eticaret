"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { headerTheme } from "@/lib/theme";

interface Props {
  email: string;
}

// Banner tam wave çukurunu kaplar:
// - fixed, z-41 → header'ın (z-40) üstünde, wave'i örter
// - top = solidHeight → duyuru + nav'ın hemen altından başlar
// - height = waveDepth → wave çukurunun tam derinliğine eşit
const TOP = headerTheme.solidHeight;          // 125 px
const HEIGHT = headerTheme.waveDepth;         // 90 px

export function EmailVerifyBanner({ email }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (dismissed) return null;

  async function resend() {
    setSending(true);
    await fetch("/api/auth/resend-verify", { method: "POST" });
    setSending(false);
    setSent(true);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: TOP,
        left: 0,
        right: 0,
        height: HEIGHT,
        zIndex: 39,
        display: "flex",
        alignItems: "flex-end",
        paddingBottom: 14,
      }}
      className="bg-red-50 border-b border-red-200 px-4 shadow-sm"
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-red-800">
          <Mail size={16} className="shrink-0" />
          <span>
            <strong>{email}</strong> adresiniz doğrulanmadı.{" "}
            {sent ? (
              <span className="text-green-700 font-semibold">Doğrulama maili gönderildi!</span>
            ) : (
              <button
                onClick={resend}
                disabled={sending}
                className="underline font-semibold hover:text-red-900"
              >
                {sending ? "Gönderiliyor..." : "Tekrar gönder"}
              </button>
            )}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-red-600 hover:text-red-900 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

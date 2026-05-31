"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { headerTheme } from "@/lib/theme";
import { useScrollPosition } from "@/hooks/useScrollPosition";

interface Props {
  email: string;
}

const TOP = headerTheme.solidHeight;
const HEIGHT = headerTheme.waveDepth;

export function EmailVerifyBanner({ email }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 20;

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
        zIndex: 37,
        display: "flex",
        alignItems: "flex-end",
        paddingBottom: 14,
        transform: isScrolled ? `translateY(-${headerTheme.announcementHeight}px)` : "translateY(0)",
        transition: "transform 300ms",
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

"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";

interface Props {
  email: string;
}

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
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <Mail size={16} className="shrink-0" />
          <span>
            <strong>{email}</strong> adresiniz doğrulanmadı.{" "}
            {sent ? (
              <span className="text-green-700 font-semibold">Doğrulama maili gönderildi!</span>
            ) : (
              <button onClick={resend} disabled={sending} className="underline font-semibold hover:text-amber-900">
                {sending ? "Gönderiliyor..." : "Tekrar gönder"}
              </button>
            )}
          </span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-900">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

interface Props {
  title: string;
  ctaText?: string;
  ctaUrl?: string;
  bgColor?: string;
  textColor?: string;
  endsAt?: Date | string | null;
  showCountdown?: boolean;
}

export function FloatingBar({ title, ctaText, ctaUrl, bgColor = "#F9B10B", textColor = "#fff", endsAt, showCountdown }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4 px-4 py-2.5 text-sm font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <span>{title}</span>
      {showCountdown && endsAt && <CountdownTimer endsAt={endsAt} />}
      {ctaText && ctaUrl && (
        <Link
          href={ctaUrl}
          className="bg-white px-3 py-1 rounded-full text-xs font-bold"
          style={{ color: bgColor }}
        >
          {ctaText}
        </Link>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 opacity-70 hover:opacity-100"
        style={{ color: textColor }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

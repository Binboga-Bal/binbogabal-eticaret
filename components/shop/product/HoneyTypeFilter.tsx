"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type HoneyTypeItem = { id: string; slug: string; label: string };

const VISUAL_MAP: Record<string, { icon: React.ReactNode; bg: string; activeBg: string; border: string; activeBorder: string; text: string }> = {
  CAM: {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <path d="M20 4 L26 14 H22 L28 24 H23 L30 36 H10 L17 24 H12 L18 14 H14 Z" fill="currentColor" opacity="0.85" />
      </svg>
    ),
    bg: "bg-emerald-50", activeBg: "bg-emerald-600", border: "border-emerald-200", activeBorder: "border-emerald-600", text: "text-emerald-700",
  },
  KEVEN_KEKIK: {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <ellipse cx="20" cy="12" rx="5" ry="8" fill="currentColor" opacity="0.85" transform="rotate(-20 20 12)" />
        <ellipse cx="14" cy="18" rx="4" ry="7" fill="currentColor" opacity="0.7" transform="rotate(15 14 18)" />
        <ellipse cx="26" cy="18" rx="4" ry="7" fill="currentColor" opacity="0.7" transform="rotate(-15 26 18)" />
        <rect x="18.5" y="20" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    bg: "bg-lime-50", activeBg: "bg-lime-600", border: "border-lime-200", activeBorder: "border-lime-600", text: "text-lime-700",
  },
  NARENCIYE: {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <circle cx="20" cy="22" r="13" fill="currentColor" opacity="0.85" />
        <path d="M20 9 Q22 4 20 2 Q18 4 20 9Z" fill="currentColor" opacity="0.6" />
        <path d="M20 9 Q25 6 26 4 Q22 5 20 9Z" fill="currentColor" opacity="0.4" />
        <circle cx="20" cy="22" r="7" fill="white" opacity="0.25" />
        <line x1="20" y1="15" x2="20" y2="29" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="13" y1="22" x2="27" y2="22" stroke="white" strokeWidth="1" opacity="0.4" />
      </svg>
    ),
    bg: "bg-orange-50", activeBg: "bg-orange-500", border: "border-orange-200", activeBorder: "border-orange-500", text: "text-orange-600",
  },
  CICEK: {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <ellipse cx="20" cy="10" rx="4" ry="7" fill="currentColor" opacity="0.75" />
        <ellipse cx="20" cy="10" rx="4" ry="7" fill="currentColor" opacity="0.75" transform="rotate(60 20 20)" />
        <ellipse cx="20" cy="10" rx="4" ry="7" fill="currentColor" opacity="0.75" transform="rotate(120 20 20)" />
        <ellipse cx="20" cy="10" rx="4" ry="7" fill="currentColor" opacity="0.75" transform="rotate(180 20 20)" />
        <ellipse cx="20" cy="10" rx="4" ry="7" fill="currentColor" opacity="0.75" transform="rotate(240 20 20)" />
        <ellipse cx="20" cy="10" rx="4" ry="7" fill="currentColor" opacity="0.75" transform="rotate(300 20 20)" />
        <circle cx="20" cy="20" r="5" fill="white" opacity="0.9" />
        <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.9" />
      </svg>
    ),
    bg: "bg-pink-50", activeBg: "bg-pink-500", border: "border-pink-200", activeBorder: "border-pink-500", text: "text-pink-600",
  },
  OZEL: {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <polygon points="20,4 24,15 36,15 26,22 30,34 20,27 10,34 14,22 4,15 16,15" fill="currentColor" opacity="0.85" />
      </svg>
    ),
    bg: "bg-amber-50", activeBg: "bg-amber-500", border: "border-amber-200", activeBorder: "border-amber-500", text: "text-amber-600",
  },
};

const DEFAULT_VISUAL = {
  icon: null,
  bg: "bg-gray-50", activeBg: "bg-gray-600", border: "border-gray-200", activeBorder: "border-gray-600", text: "text-gray-700",
};

interface Props {
  honeyTypes: HoneyTypeItem[];
}

export function HoneyTypeFilter({ honeyTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("tur");

  const toggle = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("tur") === slug) {
        params.delete("tur");
      } else {
        params.set("tur", slug);
      }
      params.delete("sayfa");
      router.push(`/urunlerimiz?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      {honeyTypes.map((t) => {
        const visual = VISUAL_MAP[t.slug] ?? DEFAULT_VISUAL;
        const isActive = active === t.slug;
        return (
          <button
            key={t.id}
            onClick={() => toggle(t.slug)}
            className={`
              flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 transition-all duration-200
              ${isActive
                ? `${visual.activeBg} ${visual.activeBorder} text-white shadow-md scale-[1.04]`
                : `${visual.bg} ${visual.border} ${visual.text} hover:scale-[1.02] hover:shadow-sm`
              }
            `}
          >
            {visual.icon && <span className={isActive ? "text-white" : ""}>{visual.icon}</span>}
            <span className="text-xs font-semibold whitespace-nowrap">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";
import { headerTheme } from "@/lib/theme";
import { useScrollPosition } from "@/hooks/useScrollPosition";

interface CartBannerProps {
  textLeft: string;
  textRight: string;
  color: string;
}

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string; btn: string }> = {
  honey: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    icon: "text-amber-600",
    btn: "text-amber-500 hover:text-amber-700",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-900",
    icon: "text-green-600",
    btn: "text-green-500 hover:text-green-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    icon: "text-blue-600",
    btn: "text-blue-500 hover:text-blue-700",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    icon: "text-red-600",
    btn: "text-red-500 hover:text-red-700",
  },
};

const TOP = headerTheme.solidHeight;
const HEIGHT = headerTheme.waveDepth;

export function CartBanner({ textLeft, textRight, color }: CartBannerProps) {
  const [visible, setVisible] = useState(true);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 20;

  if (!visible) return null;

  const c = colorMap[color] ?? colorMap.honey;

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
        alignItems: "center",
        transform: isScrolled ? `translateY(-${headerTheme.announcementHeight}px)` : "translateY(0)",
        transition: "transform 300ms",
      }}
      className={`${c.bg} border-b ${c.border} px-4 shadow-sm`}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Sol */}
        <div className={`flex items-center gap-2 text-sm font-medium ${c.text}`}>
          <Tag size={15} className={`${c.icon} shrink-0`} />
          <span>{textLeft}</span>
        </div>

        {/* Sağ */}
        <div className="flex items-center gap-3">
          {textRight && (
            <span className={`text-sm font-medium ${c.text}`}>{textRight}</span>
          )}
          <button
            onClick={() => {
              setVisible(false);
              window.dispatchEvent(new CustomEvent("cart-banner-dismissed"));
            }}
            className={`${c.btn} transition-colors shrink-0`}
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

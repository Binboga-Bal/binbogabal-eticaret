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

const colorMap: Record<
  string,
  { bg: string; border: string; text: string; icon: string; btn: string }
> = {
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
        minHeight: HEIGHT,
        height: "auto",
        zIndex: 37,
        display: "flex",
        alignItems: "center",
        transform: isScrolled
          ? `translateY(-${headerTheme.announcementHeight}px)`
          : "translateY(0)",
        transition: "transform 300ms",
      }}
      className={`${c.bg} border-b ${c.border} shadow-sm px-24`}
    >
      <div className="w-full flex items-center justify-between gap-2 px-3 pt-[58px] pb-3 sm:pt-0 sm:pb-0">
        <div
          className={`flex items-start sm:items-center gap-2 text-xs sm:text-sm font-medium ${c.text} min-w-0`}
        >
          <Tag size={14} className={`${c.icon} shrink-0 mt-0.5 sm:mt-0`} />
          <span>{textLeft}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {textRight && (
            <span
              className={`text-xs sm:text-sm font-medium ${c.text} opacity-80`}
            >
              {textRight}
            </span>
          )}
          <button
            onClick={() => {
              setVisible(false);
              window.dispatchEvent(new CustomEvent("cart-banner-dismissed"));
            }}
            className={`${c.btn} transition-colors`}
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

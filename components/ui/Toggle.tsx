"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, size = "md", label }: ToggleProps) {
  const isMd = size === "md";

  // track: md=56×32px  sm=40×24px
  const track = isMd ? "w-14 h-8" : "w-10 h-6";

  // thumb track yüksekliğinden 4px küçük (2px boşluk her taraftan)
  // md: 28px  sm: 20px
  const thumbSize = isMd ? "w-7 h-7 top-[2px]" : "w-5 h-5 top-[2px]";

  // OFF: 2px solda  |  ON: track_w - thumb_w - 2px sağ boşluk
  // md: 56 - 28 - 2 = 26px  |  sm: 40 - 20 - 2 = 18px
  const thumbPos = checked
    ? isMd ? "translate-x-[26px]" : "translate-x-[18px]"
    : "translate-x-[2px]";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative shrink-0 rounded-full transition-all duration-300 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-honey",
        track,
        checked
          ? "bg-gradient-to-r from-honey-bright to-honey-dark"
          : "bg-gray-200",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute bg-white rounded-full transition-transform duration-300 ease-in-out",
          "shadow-[0_2px_6px_rgba(0,0,0,0.22)]",
          thumbSize,
          thumbPos,
        ].join(" ")}
      />
    </button>
  );
}

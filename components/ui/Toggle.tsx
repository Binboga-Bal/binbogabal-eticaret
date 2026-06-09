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

  // md: 56×28px  |  sm: 40×24px
  const track = isMd ? "w-14 h-7" : "w-10 h-6";

  // thumb neredeyse track yüksekliğini dolduruyor (md: 22/28 ≈ 79%, sm: 18/24 = 75%)
  const thumbSize = isMd ? "w-[22px] h-[22px] top-[3px]" : "w-[18px] h-[18px] top-[3px]";
  const thumbPos  = checked
    ? isMd ? "translate-x-[31px]" : "translate-x-[19px]"
    : "translate-x-[3px]";

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
          ? "bg-gradient-to-br from-honey to-honey-dark shadow-[0_2px_10px_rgba(197,121,48,0.45)]"
          : "bg-gray-200",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute bg-white rounded-full transition-transform duration-300 ease-in-out",
          "shadow-[0_1px_4px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.12)]",
          thumbSize,
          thumbPos,
        ].join(" ")}
      />
    </button>
  );
}

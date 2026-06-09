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

  // md: 28×28px  sm: 20×20px — her yanda 2px boşluk
  const thumbSize = isMd ? "w-7 h-7 top-[2px]" : "w-5 h-5 top-[2px]";

  // md: 56-28-2=26px  sm: 40-20-2=18px
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-honey",
        track,
        checked
          ? [
              "bg-gradient-to-b from-honey-bright to-honey-dark",
              "ring-2 ring-inset ring-honey-dark/30",
              "shadow-[inset_0_2px_5px_rgba(0,0,0,0.22)]",
            ].join(" ")
          : [
              "bg-gradient-to-b from-gray-200 to-gray-300",
              "ring-2 ring-inset ring-gray-400/40",
              "shadow-[inset_0_2px_4px_rgba(0,0,0,0.13)]",
            ].join(" "),
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.97]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute rounded-full transition-transform duration-300 ease-in-out",
          "bg-gradient-to-b from-white to-gray-50",
          "shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.2),0_0_0_0.5px_rgba(0,0,0,0.08)]",
          thumbSize,
          thumbPos,
        ].join(" ")}
      />
    </button>
  );
}

"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, size = "md", label }: ToggleProps) {
  const track =
    size === "sm"
      ? "w-8 h-[18px]"
      : "w-11 h-6";
  const thumb =
    size === "sm"
      ? `w-3 h-3 top-[3px] ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`
      : `w-4 h-4 top-1 ${checked ? "translate-x-6" : "translate-x-1"}`;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-honey",
        track,
        checked
          ? "bg-honey-dark shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
          : "bg-gray-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200",
          thumb,
        ].join(" ")}
      />
    </button>
  );
}

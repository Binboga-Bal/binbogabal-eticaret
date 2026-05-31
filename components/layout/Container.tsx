import { cn } from "@/lib/utils/cn";

type ContainerSize = "content" | "wide" | "ultrawide" | "full";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * content   → max-w-content  (1280px) — varsayılan
   * wide      → max-w-wide     (1536px) — geniş layout
   * ultrawide → max-w-ultrawide(1920px) — full HD max
   * full      → max-w-full     (100%)   — tam genişlik
   */
  size?: ContainerSize;
  as?: React.ElementType;
}

const sizeClass: Record<ContainerSize, string> = {
  content:   "max-w-content",
  wide:      "max-w-wide",
  ultrawide: "max-w-ultrawide",
  full:      "max-w-full",
};

/**
 * Tüm sayfalarda tutarlı max-width ve padding için sarmalayıcı.
 *
 * Padding skalası (mobile-first):
 *   xs/sm  → px-4  (16px)
 *   md     → px-6  (24px)
 *   lg     → px-8  (32px)
 *   xl     → px-12 (48px)
 *   3xl    → px-16 (64px)  — Full HD
 *   4xl    → px-24 (96px)  — 2K
 *   5xl    → px-32 (128px) — 4K / 43"+
 */
export function Container({
  size = "content",
  as: Tag = "div",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "w-full mx-auto",
        "px-4 md:px-6 lg:px-8 xl:px-12 3xl:px-16 4xl:px-24 5xl:px-32",
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

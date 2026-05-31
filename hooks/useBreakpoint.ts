"use client";

import { useEffect, useState } from "react";

const BREAKPOINTS = {
  "5xl": 3840,
  "4xl": 2560,
  "3xl": 1920,
  "2xl": 1536,
  xl:   1280,
  lg:   1024,
  md:    768,
  sm:    640,
  xs:    375,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

function getBreakpoint(width: number): Breakpoint {
  for (const [name, minWidth] of Object.entries(BREAKPOINTS)) {
    if (width >= minWidth) return name as Breakpoint;
  }
  return "xs";
}

/**
 * Geçerli Tailwind breakpoint adını döner.
 * SSR'da "xs" döner; hydration sonrası güncellenir.
 *
 * @example
 * const bp = useBreakpoint()
 * const isMobile     = ["xs", "sm"].includes(bp)
 * const isWidescreen = ["3xl", "4xl", "5xl"].includes(bp)
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("xs");

  useEffect(() => {
    const update = () => setBp(getBreakpoint(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

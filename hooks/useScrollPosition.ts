"use client";

import { useEffect, useState } from "react";

/**
 * Sayfa scroll Y pozisyonunu döner.
 * SSR'da 0 döner.
 */
export function useScrollPosition(): number {
  const [y, setY] = useState(0);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return y;
}

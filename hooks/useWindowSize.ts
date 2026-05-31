"use client";

import { useEffect, useState } from "react";

interface WindowSize {
  width:  number;
  height: number;
}

/**
 * Pencere boyutunu döner. SSR'da {width:0, height:0} döner.
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

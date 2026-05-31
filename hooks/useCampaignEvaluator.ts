"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCartStore } from "@/store/cart";

export function useCampaignEvaluator() {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCampaignResult = useCartStore((s) => s.setCampaignResult);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const evaluate = useCallback(async () => {
    if (items.length === 0) {
      setCampaignResult(null);
      return;
    }

    try {
      const res = await fetch("/api/campaigns/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: items.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discountedPrice: item.discountedPrice,
            productName: item.productName,
          })),
          couponCode: couponCode ?? undefined,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setCampaignResult(result);
      }
    } catch {
      // Ağ hatası — mevcut sonucu koru
    }
  }, [items, couponCode, setCampaignResult]);

  // Sepet veya kupon değişince debounce ile değerlendir
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(evaluate, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [evaluate]);
}

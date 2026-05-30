"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface Props {
  productId: string;
}

export function FavoriteButton({ productId }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/customer/favorites")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data: { productId: string }[] | null) => {
        if (Array.isArray(data)) {
          setIsFav(data.some((f) => f.productId === productId));
        }
      })
      .catch(() => {});
  }, [productId]);

  async function toggle() {
    setLoading(true);
    try {
      if (isFav) {
        const r = await fetch(`/api/customer/favorites/${productId}`, { method: "DELETE" });
        if (r.status === 401) { window.location.href = "/hesabim/giris"; return; }
        setIsFav(false);
      } else {
        const r = await fetch("/api/customer/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (r.status === 401) { window.location.href = "/hesabim/giris"; return; }
        setIsFav(true);
      }
    } catch {
      // sessiz hata
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      title={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all disabled:opacity-60 ${
        isFav
          ? "border-red-400 bg-red-50 text-red-500"
          : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400 hover:bg-red-50"
      }`}
    >
      <Heart size={18} fill={isFav ? "currentColor" : "none"} />
      {isFav ? "Favorilerimde" : "Favorilere Ekle"}
    </button>
  );
}

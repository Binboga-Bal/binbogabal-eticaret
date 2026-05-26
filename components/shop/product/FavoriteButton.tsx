"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface Props {
  productId: string;
}

export function FavoriteButton({ productId }: Props) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs: string[] = JSON.parse(localStorage.getItem("favorites") ?? "[]");
    setIsFav(favs.includes(productId));
  }, [productId]);

  function toggle() {
    const favs: string[] = JSON.parse(localStorage.getItem("favorites") ?? "[]");
    const updated = favs.includes(productId)
      ? favs.filter((id) => id !== productId)
      : [...favs, productId];
    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFav(updated.includes(productId));
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      title={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
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

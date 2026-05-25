"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  currentSort: string;
}

export function SortSelect({ currentSort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("siralama", e.target.value);
    } else {
      params.delete("siralama");
    }
    router.push(`/urunlerimiz?${params.toString()}`, { scroll: false });
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey"
    >
      <option value="">Sıralama</option>
      <option value="yeni">En Yeni</option>
      <option value="fiyat-asc">Fiyat: Düşükten Yükseğe</option>
      <option value="fiyat-desc">Fiyat: Yüksekten Düşüğe</option>
    </select>
  );
}

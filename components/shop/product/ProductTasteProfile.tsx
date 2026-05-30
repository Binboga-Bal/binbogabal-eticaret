import Image from "next/image";
import { Egg, Coffee, Cake, Leaf, Blend, Apple } from "lucide-react";

const USAGE_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
  kahvalti: {
    label: "Kahvaltı",
    icon: <Egg size={28} strokeWidth={1.5} />,
  },
  cay: {
    label: "Çay",
    icon: <Coffee size={28} strokeWidth={1.5} />,
  },
  tatli: {
    label: "Tatlı",
    icon: <Cake size={28} strokeWidth={1.5} />,
  },
  smoothie: {
    label: "Smoothie",
    icon: <Blend size={28} strokeWidth={1.5} />,
  },
  pisen: {
    label: "Pişen Tarif",
    icon: <Leaf size={28} strokeWidth={1.5} />,
  },
  atistirmalik: {
    label: "Atıştırmalık",
    icon: <Apple size={28} strokeWidth={1.5} />,
  },
};

const DEFAULT_TASTE_NOTES = [
  "Hafif, aromatik, leziz ve dengeli tat profili.",
  "Kahvaltı, sıcak içecek ve tatlı tarifleri için ideal.",
  "Doğal tatlandırıcı olarak günlük kullanıma uygundur.",
];

const DEFAULT_USAGE: string[] = ["kahvalti", "cay", "tatli"];

interface Props {
  tasteNotes?: string[] | null;
  usageSuggestions?: string[] | null;
}

export function ProductTasteProfile({ tasteNotes, usageSuggestions }: Props) {
  const notes =
    tasteNotes && tasteNotes.length > 0 ? tasteNotes : DEFAULT_TASTE_NOTES;
  const usage =
    usageSuggestions && usageSuggestions.length > 0
      ? usageSuggestions
      : DEFAULT_USAGE;

  return (
    <div className="mt-12 rounded-3xl border border-gray-100 bg-white overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Sol: içerik */}
        <div className="flex flex-col justify-center px-8 py-12 lg:px-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Tat Profili ve Kullanım Önerileri
          </h2>

          <ul className="space-y-3 mb-8">
            {notes.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="mt-1.5 w-2 h-2 rounded-full bg-honey flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            {usage.map((key) => {
              const item = USAGE_MAP[key];
              if (!item) return null;
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-[#FFF8EE] px-5 py-4 text-center min-w-[90px]"
                >
                  <span className="text-gray-700">{item.icon}</span>
                  <span className="text-xs font-bold text-gray-800">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ: görsel */}
        <div className="relative min-h-[280px] md:min-h-0 bg-[#FFF8EE] rounded-b-3xl md:rounded-none md:rounded-r-3xl overflow-hidden">
          <Image
            src="/images/home-screen/first-infographics/guvenilir-bal.webp"
            alt="Tat profili görseli"
            fill
            className="object-contain p-10"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
}

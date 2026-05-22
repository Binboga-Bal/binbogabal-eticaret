import Image from "next/image";
import { trustBadgesTheme } from "@/lib/theme";

const badges = trustBadgesTheme.badges;

export function TrustBadges() {
  return (
    <section className="bg-gradient-to-b from-white to-honey-cream py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center gap-4"
            >
              {/* İnfografik görsel */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <Image
                  src={badge.image}
                  alt={badge.title}
                  fill
                  className="object-contain drop-shadow-sm"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              </div>

              {/* Metin */}
              <div>
                <p className="text-sm font-bold text-gray-800 leading-snug">
                  {badge.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { trustBadgesTheme } from "@/lib/theme";
import { Container } from "@/components/layout/Container";

const baseBadges = trustBadgesTheme.badges;

interface TrustBadgesProps {
  images?: (string | null)[];
}

export function TrustBadges({ images = [] }: TrustBadgesProps) {
  const badges = baseBadges.map((b, i) => ({ ...b, image: images[i] ?? b.image }));
  return (
    <section className="bg-gradient-to-b from-white to-honey-cream section-padding">
      <Container size="wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 3xl:gap-16">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 3xl:w-48 3xl:h-48 flex-shrink-0">
                <Image
                  src={badge.image}
                  alt={badge.title}
                  fill
                  className="object-contain drop-shadow-sm"
                  sizes="(max-width: 768px) 128px, (max-width: 1920px) 160px, 192px"
                />
              </div>
              <div>
                <p className="text-fluid-base font-bold text-gray-800 leading-snug">
                  {badge.title}
                </p>
                <p className="text-fluid-sm text-gray-500 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

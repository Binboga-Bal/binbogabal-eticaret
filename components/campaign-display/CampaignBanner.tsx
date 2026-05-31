import Link from "next/link";
import Image from "next/image";
import { CountdownTimer } from "./CountdownTimer";

interface Display {
  id: string;
  type: string;
  imageUrl: string | null;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  bgColor: string | null;
  textColor: string | null;
  showCountdown: boolean;
}

interface Props {
  display: Display;
  endsAt?: Date | string | null;
}

export function CampaignBanner({ display, endsAt }: Props) {
  const bg = display.bgColor ?? "#F9B10B";
  const color = display.textColor ?? "#fff";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between"
      style={{ backgroundColor: bg, color }}
    >
      {display.imageUrl && (
        <Image
          src={display.imageUrl}
          alt={display.title ?? "Kampanya"}
          fill
          className="object-cover opacity-20"
        />
      )}
      <div className="relative z-10">
        {display.title && (
          <h3 className="text-xl font-black" style={{ color }}>{display.title}</h3>
        )}
        {display.subtitle && (
          <p className="text-sm mt-1 opacity-90" style={{ color }}>{display.subtitle}</p>
        )}
        {display.showCountdown && endsAt && (
          <div className="mt-2">
            <CountdownTimer endsAt={endsAt} />
          </div>
        )}
        {display.ctaText && display.ctaUrl && (
          <Link
            href={display.ctaUrl}
            className="mt-3 inline-block bg-white px-4 py-2 rounded-xl text-sm font-bold"
            style={{ color: bg }}
          >
            {display.ctaText}
          </Link>
        )}
      </div>
    </div>
  );
}

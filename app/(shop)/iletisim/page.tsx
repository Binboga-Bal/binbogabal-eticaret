import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/shop/contact/ContactForm";
import { buildMetadata } from "@/lib/seo/meta.service";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page", "iletisim", {
    title: "İletişim | Binboğa Kooperatif Balı",
    description: "Binboğa Bal ile iletişime geçin. Adres, telefon ve e-posta bilgilerimiz.",
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/iletisim`,
  });
}

const D = {
  hero_h1: "İletişim",
  hero_subtitle: "Her türlü soru ve öneriniz için buradayız.",
  address: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi\nAdana, Kozan",
  phone: "+90 (322) XXX XX XX",
  email: "info@binbogabal.com.tr",
  hours: "Pazartesi – Cuma: 09:00 – 18:00\nCumartesi: 09:00 – 13:00",
} as const;

const PFX = "page_iletisim_";
const ALL_KEYS = [
  ...(Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`),
  "banner_iletisim",
  "map_embed_url",
];

function t(db: Record<string, string>, key: keyof typeof D): string {
  return db[`${PFX}${key}`] || D[key];
}

export default async function ContactPage() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const bannerImage = db.banner_iletisim ?? null;
  const mapEmbedUrl = db.map_embed_url ?? null;

  const contactItems = [
    {
      icon: <MapPin size={18} className="text-white/80" />,
      label: "Adres",
      value: t(db, "address"),
    },
    {
      icon: <Phone size={18} className="text-white/80" />,
      label: "Telefon",
      value: t(db, "phone"),
      href: `tel:${t(db, "phone").replace(/\s/g, "")}`,
    },
    {
      icon: <Mail size={18} className="text-white/80" />,
      label: "E-posta",
      value: t(db, "email"),
      href: `mailto:${t(db, "email")}`,
    },
    {
      icon: <Clock size={18} className="text-white/80" />,
      label: "Çalışma Saatleri",
      value: t(db, "hours"),
    },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-80 md:h-[500px] xl:h-[560px] 2xl:h-[620px] 3xl:h-[680px] 4xl:h-[760px] overflow-hidden bg-honey-dark">
        {bannerImage ? (
          <>
            <Image
              src={bannerImage}
              alt="İletişim banner"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-honey-bright"
                style={{
                  width: ((i * 37) % 80) + 20,
                  height: ((i * 53) % 80) + 20,
                  top: `${(i * 17) % 100}%`,
                  left: `${(i * 23) % 100}%`,
                }}
              />
            ))}
          </div>
        )}
        <div className="relative z-10 h-full flex items-center justify-start">
          <div className="max-w-7xl w-full px-8 sm:px-14 lg:px-24 xl:px-36 text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t(db, "hero_h1")}
            </h1>
            <p className="hidden sm:block text-white/80 text-lg max-w-2xl">
              {t(db, "hero_subtitle")}
            </p>
          </div>
        </div>
      </section>

      <ContactForm contactItems={contactItems} mapEmbedUrl={mapEmbedUrl} />
    </>
  );
}

export const dynamic = "force-dynamic";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: { absolute: "Bakım Çalışması | Binboğa Kooperatif Balı" },
  robots: { index: false, follow: false },
};

export default async function MaintenancePage() {
  const rows = await prisma.siteSetting
    .findMany({
      where: { key: { in: ["maintenance_message", "contact_phone", "contact_email", "img_logo"] } },
      select: { key: true, value: true },
    })
    .catch(() => [] as { key: string; value: string }[]);

  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const message =
    s.maintenance_message ||
    "Sitemiz şu anda bakım çalışması yapılmaktadır. Kısa süre içinde geri döneceğiz.";
  const phone = s.contact_phone || "0 (322) 515 89 10";
  const email = s.contact_email || "info@binbogabal.com.tr";
  const logoSrc = s.img_logo || "/images/logo.png";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #FFF8E7 0%, #FEF3C7 60%, #FDE68A 100%)" }}
    >
      {/* Üst şerit */}
      <div className="h-1.5 w-full" style={{ background: "#C57930" }} />

      {/* Logo alanı */}
      <header className="flex justify-center pt-10 pb-6">
        <Image
          src={logoSrc}
          alt="Binboğa Kooperatif Balı"
          width={160}
          height={100}
          className="object-contain drop-shadow-sm"
          priority
        />
      </header>

      {/* Ana içerik */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="text-center max-w-lg">
          {/* Petek ikonu */}
          <div className="flex justify-center mb-8">
            <HoneycombIcon />
          </div>

          <h1
            className="text-4xl font-black mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-poppins)", color: "#7C2D12" }}
          >
            Bakım Çalışması
          </h1>

          <div
            className="w-16 h-1 rounded-full mx-auto mb-6"
            style={{ background: "#C57930" }}
          />

          <p
            className="text-lg leading-relaxed mb-10"
            style={{ color: "#92400E", fontFamily: "var(--font-inter)" }}
          >
            {message}
          </p>

          {/* İletişim */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors hover:opacity-80"
                style={{ background: "#C57930", color: "#FFFFFF" }}
              >
                <PhoneIcon />
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors hover:opacity-80"
                style={{ borderColor: "#C57930", color: "#C57930", background: "transparent" }}
              >
                <MailIcon />
                {email}
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Alt bilgi */}
      <footer className="text-center py-6 text-sm" style={{ color: "#A16207" }}>
        © {new Date().getFullYear()} Binboğa Kooperatif Balı &mdash; Kozan / Adana
      </footer>

      {/* Alt şerit */}
      <div className="h-1.5 w-full" style={{ background: "#C57930" }} />
    </div>
  );
}

function HoneycombIcon() {
  return (
    <svg width="72" height="80" viewBox="0 0 72 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Merkez petek */}
      <polygon
        points="36,4 63,20 63,52 36,68 9,52 9,20"
        fill="#F9B10B"
        stroke="#C57930"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* İç çizgiler */}
      <polygon
        points="36,16 52,25 52,43 36,52 20,43 20,25"
        fill="#FCD908"
        stroke="#C57930"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Bal damlası */}
      <path
        d="M36 26 C36 26 29 35 29 40 C29 43.86 32.13 47 36 47 C39.87 47 43 43.86 43 40 C43 35 36 26 36 26Z"
        fill="#C57930"
        opacity="0.85"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.94a16 16 0 006.15 6.15l1.31-1.3a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

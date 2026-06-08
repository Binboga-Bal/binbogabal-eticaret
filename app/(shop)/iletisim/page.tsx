import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "İletişim | Binboğa Kooperatif Balı",
  description: "Binboğa Bal ile iletişime geçin. Adres, telefon ve e-posta bilgilerimiz.",
};

const D = {
  hero_h1: "İletişim",
  hero_subtitle: "Her türlü soru ve öneriniz için buradayız.",
  address: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi\nAdana, Kozan",
  phone: "+90 (322) XXX XX XX",
  email: "info@binbogabal.com.tr",
  hours: "Pazartesi – Cuma: 09:00 – 18:00\nCumartesi: 09:00 – 13:00",
} as const;

const PFX = "page_iletisim_";
const ALL_KEYS = (Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`);

function t(db: Record<string, string>, key: keyof typeof D): string {
  return db[`${PFX}${key}`] || D[key];
}

export default async function ContactPage() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const contactItems = [
    {
      icon: <MapPin size={20} className="text-honey-dark" />,
      label: "Adres",
      value: t(db, "address"),
    },
    {
      icon: <Phone size={20} className="text-honey-dark" />,
      label: "Telefon",
      value: t(db, "phone"),
    },
    {
      icon: <Mail size={20} className="text-honey-dark" />,
      label: "E-posta",
      value: t(db, "email"),
    },
    {
      icon: <Clock size={20} className="text-honey-dark" />,
      label: "Çalışma Saatleri",
      value: t(db, "hours"),
    },
  ];

  return (
    <>
      <section className="bg-honey-dark py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-3">{t(db, "hero_h1")}</h1>
          <p className="text-white/70 text-sm">{t(db, "hero_subtitle")}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Bilgiler */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900">Bize Ulaşın</h2>
              <div className="space-y-5">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-honey-cream rounded-2xl p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Mesaj Gönderin</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad Soyad</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey bg-white"
                    placeholder="Adınız ve soyadınız"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta</label>
                  <input
                    type="email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey bg-white"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konu</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey bg-white"
                    placeholder="Mesajınızın konusu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mesajınız</label>
                  <textarea
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey resize-none bg-white"
                    placeholder="Mesajınızı buraya yazın..."
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

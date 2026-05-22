import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim | Binboğa Kooperatif Balı",
  description: "Binboğa Bal ile iletişime geçin. Adres, telefon ve e-posta bilgilerimiz.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-honey-dark py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-3">İletişim</h1>
          <p className="text-white/70 text-sm">Her türlü soru ve öneriniz için buradayız.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Bilgiler */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900">Bize Ulaşın</h2>
              <div className="space-y-5">
                {[
                  {
                    icon: <MapPin size={20} className="text-honey-dark" />,
                    label: "Adres",
                    value: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi\nAdana, Kozan",
                  },
                  {
                    icon: <Phone size={20} className="text-honey-dark" />,
                    label: "Telefon",
                    value: "+90 (322) XXX XX XX",
                  },
                  {
                    icon: <Mail size={20} className="text-honey-dark" />,
                    label: "E-posta",
                    value: "info@binbogabal.com.tr",
                  },
                  {
                    icon: <Clock size={20} className="text-honey-dark" />,
                    label: "Çalışma Saatleri",
                    value: "Pazartesi – Cuma: 09:00 – 18:00\nCumartesi: 09:00 – 13:00",
                  },
                ].map((item) => (
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
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
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

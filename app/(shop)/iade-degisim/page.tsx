import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Package, Mail, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "İade & Değişim | Binboğa Bal",
};

export default async function ReturnPage() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "contact_email_iade" } });
  const iadeEmail = setting?.value ?? "iade@binbogabal.com.tr";

  const steps = [
    {
      icon: <Mail size={24} />,
      title: "Bize Bildirin",
      desc: `${iadeEmail} adresine sipariş numaranız ve iade nedeninizle e-posta gönderin.`,
    },
    {
      icon: <Package size={24} />,
      title: "Ürünü Paketleyin",
      desc: "Ürünü orijinal ambalajında, hasar vermeden paketleyin.",
    },
    {
      icon: <RefreshCw size={24} />,
      title: "Kargoya Verin",
      desc: "İade kargosunu anlaşmalı kargo firmasıyla gönderin. Kargo ücreti size aittir.",
    },
    {
      icon: <Clock size={24} />,
      title: "İadenizi Alın",
      desc: "Ürün incelendikten sonra 14 iş günü içinde ödemeniz iade edilir.",
    },
  ];

  return (
    <>
      <section className="bg-honey-dark py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-3">İade & Değişim</h1>
          <p className="text-white/70 text-sm">
            Memnun kalmamanız durumunda teslimattan itibaren 14 gün içinde iade yapabilirsiniz.
          </p>
        </div>
      </section>

      <section className="pt-28 pb-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-honey-cream text-honey-dark mb-4">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-honey-dark mb-1">Adım {i + 1}</div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-2xl p-6">
              <h2 className="font-bold text-gray-800 mb-4">✅ İade Edilebilir Ürünler</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Açılmamış, orijinal ambalajında ürünler</li>
                <li>• Hasar görmemiş ürünler</li>
                <li>• Teslim tarihinden itibaren 14 gün içinde bildirilen iadeler</li>
                <li>• Yanlış ürün gönderiminde kargo ücreti tarafımıza aittir</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-2xl p-6">
              <h2 className="font-bold text-gray-800 mb-4">❌ İade Edilemeyen Ürünler</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Açılmış veya kullanılmış ürünler (gıda hijyeni nedeniyle)</li>
                <li>• 14 günlük iade süresini geçmiş ürünler</li>
                <li>• Ambalajı zarar görmüş ürünler (alıcı kusuru)</li>
                <li>• Hasarlı teslimat için kargo firmasına bildirimde bulunulmalıdır</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 bg-honey-cream rounded-2xl p-8 text-center">
            <h2 className="text-xl font-black text-gray-900 mb-3">İade Talebiniz mi Var?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Sipariş numaranız ve iade nedeninizle bize ulaşın, size yardımcı olalım.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`mailto:${iadeEmail}`} className="btn-primary">
                E-posta Gönder
              </a>
              <Link href="/iletisim" className="btn-secondary">
                İletişim Formu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

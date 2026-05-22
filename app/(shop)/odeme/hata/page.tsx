import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, RefreshCw } from "lucide-react";

export const metadata: Metadata = { title: "Ödeme Başarısız | Binboğa Bal" };

export default function PaymentFailurePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle size={48} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Ödeme Başarısız</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Ödeme işleminiz gerçekleştirilemedi. Kart bilgilerinizi kontrol edip tekrar deneyebilir
          veya farklı bir ödeme yöntemi kullanabilirsiniz.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 text-left space-y-2">
          <p className="text-sm font-semibold text-gray-700">Sık karşılaşılan nedenler:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Yetersiz bakiye</li>
            <li>• Hatalı kart numarası veya CVV</li>
            <li>• Kart limitinin aşılması</li>
            <li>• İnternet alışverişine kapalı kart</li>
            <li>• Bankanızın 3D Secure doğrulaması başarısız</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/odeme" className="btn-primary flex items-center gap-2">
            <RefreshCw size={14} /> Tekrar Dene
          </Link>
          <Link href="/sepet" className="btn-secondary">
            Sepete Dön
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Sorun devam ederse{" "}
          <Link href="/iletisim" className="text-honey-dark hover:underline">
            bizimle iletişime geçin
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "Ödeme Başarılı | Binboğa Bal" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ siparis?: string }>;
}) {
  const { siparis } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Siparişiniz Alındı!</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Ödemeniz başarıyla tamamlandı. Siparişinizi hazırlayıp en kısa sürede kargoya
          vereceğiz. Sipariş takip bilgileri e-posta adresinize gönderilecektir.
        </p>

        {siparis && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-8">
            <p className="text-xs text-gray-500 mb-1">Sipariş Numarası</p>
            <p className="font-black text-gray-900 text-lg">{siparis}</p>
            <p className="text-xs text-gray-400 mt-2">
              Bu numarayı saklayınız. Sipariş takibinde kullanabilirsiniz.
            </p>
          </div>
        )}

        {!siparis && (
          <div className="bg-honey-cream rounded-2xl p-5 mb-8">
            <p className="text-sm text-gray-600">
              Sipariş numaranızı hesabınızdan veya e-postanızdan öğrenebilirsiniz.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/hesabim" className="btn-primary">
            Siparişlerime Git
          </Link>
          <Link href="/urunlerimiz" className="btn-secondary">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}

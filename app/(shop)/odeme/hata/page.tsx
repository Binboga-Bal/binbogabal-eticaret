export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ödeme Başarısız | Binboğa Bal" };

// QNBPay hata kodları → Türkçe kullanıcı mesajı
// Not: Kod 14 QNBPay'de "Merchant bank identification not found" — banka POS yapılandırma sorunudur, ISO 8583 ile karıştırılmamalı
const ERROR_MESSAGES: Record<string, string> = {
  "05": "Bankanız bu işlemi reddetti. Bankanızla iletişime geçin.",
  "12": "Geçersiz işlem. Lütfen tekrar deneyin.",
  "41": "Bu kart bloke edilmiş. Bankanızla iletişime geçin.",
  "43": "Bu kart bloke edilmiş. Bankanızla iletişime geçin.",
  "51": "Yetersiz bakiye veya kart limiti aşıldı.",
  "54": "Kartın son kullanma tarihi geçmiş.",
  "57": "Bu kart internet alışverişine kapalı.",
  "61": "Kart limiti aşıldı.",
  "62": "Kısıtlı kart. Bankanızla iletişime geçin.",
  "65": "Günlük işlem limitine ulaşıldı.",
  "82": "CVV hatalı.",
  "91": "Bankanıza ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
  "96": "Sistem hatası. Lütfen daha sonra tekrar deneyin.",
};

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  const invoiceId = params.invoice_id;
  const errorCode = params.error_code ?? params.status_code;
  // error param'ı "+" ile boşluk içerebilir (URL form encoding)
  const rawErrorDesc = (params.error ?? params.status_description ?? "")
    .replace(/\+/g, " ");

  // DB'yi güncelle: PENDING transaction → FAILED (idempotent)
  if (invoiceId) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber: invoiceId },
        select: { id: true },
      });
      if (order) {
        await prisma.paymentTransaction.updateMany({
          where: { orderId: order.id, status: "PENDING" },
          data: {
            status: "FAILED",
            errorMessage: rawErrorDesc
              ? rawErrorDesc.substring(0, 500)
              : `QNBPay hata kodu: ${errorCode ?? "bilinmiyor"}`,
          },
        });
      }
    } catch {
      // DB hatası sayfayı engellemesin
    }
  }

  const userMessage =
    errorCode && ERROR_MESSAGES[errorCode]
      ? ERROR_MESSAGES[errorCode]
      : null;

  const isCancelled =
    !errorCode && !params.payment_status && !invoiceId;

  return (
    <div className="px-4 pt-28 pb-16">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle size={48} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">
          {isCancelled ? "Ödeme İptal Edildi" : "Ödeme Başarısız"}
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {isCancelled
            ? "Ödeme işlemini iptal ettiniz. Sepetiniz korunmaktadır, istediğiniz zaman tekrar deneyebilirsiniz."
            : "Ödeme işleminiz gerçekleştirilemedi. Aşağıdaki bilgileri kontrol ederek tekrar deneyebilirsiniz."}
        </p>

        {/* Banka hata mesajı */}
        {userMessage && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 text-sm text-red-700 font-medium">
            {userMessage}
          </div>
        )}

        {/* Genel nedenler (banka mesajı yoksa) */}
        {!userMessage && !isCancelled && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 text-left space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              Sık karşılaşılan nedenler:
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Yetersiz bakiye veya limit aşımı</li>
              <li>• Hatalı kart numarası veya CVV</li>
              <li>• İnternet alışverişine kapalı kart</li>
              <li>• Bankanızın 3D Secure doğrulaması başarısız</li>
            </ul>
          </div>
        )}

        {/* Sipariş numarası */}
        {invoiceId && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-400 mb-1">Sipariş Numarası</p>
            <p className="font-mono text-sm font-bold text-gray-700">
              {invoiceId}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Destek alırken bu numarayı paylaşın.
            </p>
          </div>
        )}

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

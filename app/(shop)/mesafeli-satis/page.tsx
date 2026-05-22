import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Binboğa Bal",
};

export default function MesafeliSatisPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Mesafeli Satış Sözleşmesi</h1>
      <p className="text-sm text-gray-400 mb-10">
        6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında hazırlanmıştır.
      </p>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Madde 1 — Taraflar</h2>
          <p>
            <strong>SATICI:</strong> S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi, Kozan /
            Adana | info@binbogabal.com.tr
          </p>
          <p className="mt-2">
            <strong>ALICI:</strong> Ödeme formunda belirtilen ad, soyad ve iletişim bilgilerine
            sahip kişi.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Madde 2 — Konu</h2>
          <p>
            Bu sözleşme, Alıcı&apos;nın binbogabal.com.tr üzerinden sipariş verdiği ürünlerin
            satışı ve teslimatına ilişkin olarak 6502 Sayılı Tüketicinin Korunması Hakkında Kanun
            ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve
            yükümlülüklerini belirler.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Madde 3 — Teslimat</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ürünler ödeme onayından sonra 1-3 iş günü içinde kargoya verilir.</li>
            <li>Kargo süresi ortalama 2-4 iş günüdür.</li>
            <li>1.500 TL ve üzeri siparişlerde kargo ücretsizdir.</li>
            <li>Ürünler belirtilen adrese teslim edilir; adres hatası alıcıya aittir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Madde 4 — Cayma Hakkı</h2>
          <p>
            Alıcı, teslim tarihinden itibaren 14 (on dört) gün içinde herhangi bir gerekçe
            göstermeksizin cayma hakkını kullanabilir. Cayma bildirimi için{" "}
            <a href="mailto:iade@binbogabal.com.tr" className="text-honey-dark hover:underline">
              iade@binbogabal.com.tr
            </a>{" "}
            adresine e-posta gönderilmesi yeterlidir.
          </p>
          <p className="mt-2">
            <strong>İstisna:</strong> Açılmış, kullanılmış veya hijyen bozulmuş ürünlerde cayma
            hakkı kullanılamaz (TKHK Md. 15/1-ğ).
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Madde 5 — İade Koşulları</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ürün orijinal ambalajında, açılmamış ve hasarsız olmalıdır.</li>
            <li>İade kargo ücreti alıcıya aittir.</li>
            <li>Ürün incelendikten sonra iade tutarı 14 iş günü içinde ödenir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">Madde 6 — Uyuşmazlık</h2>
          <p>
            Bu sözleşmeden doğan uyuşmazlıklarda Adana Tüketici Hakem Heyeti ve Adana Mahkemeleri
            yetkilidir. Tüketici şikayetleri için Tüketici Hakem Heyeti&apos;ne başvurulabilir.
          </p>
        </section>
      </div>
    </div>
  );
}

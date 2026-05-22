import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVK Aydınlatma Metni | Binboğa Bal",
};

export default function KvkkPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni
      </h1>
      <p className="text-sm text-gray-400 mb-10">Son güncelleme: Ocak 2025</p>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, kişisel
            verileriniz; veri sorumlusu sıfatıyla <strong>S.S. 745 Sayılı Kozan Bal Tarım Satış
            Kooperatifi</strong> (&ldquo;Kooperatif&rdquo;) tarafından aşağıda açıklanan kapsamda
            işlenebilecektir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">2. İşlenen Kişisel Veriler</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kimlik bilgileri: Ad, soyad</li>
            <li>İletişim bilgileri: E-posta adresi, telefon numarası, posta adresi</li>
            <li>Sipariş bilgileri: Satın alınan ürünler, sipariş tarihi, toplam tutar</li>
            <li>Oturum bilgileri: IP adresi, tarayıcı türü</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sipariş süreçlerinin yürütülmesi ve kargo takibinin sağlanması</li>
            <li>Müşteri hizmetleri faaliyetlerinin yürütülmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, muhasebe vb.)</li>
            <li>Açık rıza alınması halinde elektronik ticari ileti gönderilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">4. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz; sipariş teslimatı amacıyla kargo firmaları, ödeme işlemleri için
            ödeme hizmet sağlayıcısı ve yasal zorunluluklar çerçevesinde yetkili kamu kurumları ile
            paylaşılmaktadır. Üçüncü şahıslarla pazarlama amacıyla paylaşım yapılmamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">5. Kişisel Veri Sahibinin Hakları</h2>
          <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içi/dışı aktarım yapıldıysa bilgi alma</li>
            <li>Eksik/yanlış işlenen verilerin düzeltilmesini isteme</li>
            <li>Silme veya yok edilmesini isteme</li>
            <li>İtiraz etme ve zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">6. Başvuru</h2>
          <p>
            Haklarınızı kullanmak için{" "}
            <a href="mailto:kvkk@binbogabal.com.tr" className="text-honey-dark hover:underline">
              kvkk@binbogabal.com.tr
            </a>{" "}
            adresine e-posta gönderebilir veya yazılı başvurunuzu kooperatif adresimize
            iletebilirsiniz. Başvurularınız en geç 30 gün içinde sonuçlandırılacaktır.
          </p>
        </section>
      </div>
    </div>
  );
}

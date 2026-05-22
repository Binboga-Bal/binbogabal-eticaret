import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Binboğa Bal",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Gizlilik Politikası</h1>
      <p className="text-sm text-gray-400 mb-10">Son güncelleme: Ocak 2025</p>

      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">1. Toplanan Veriler</h2>
          <p>
            Sitemize üye olduğunuzda ad, soyad, e-posta adresi ve telefon numarası gibi kişisel
            bilgilerinizi toplarız. Sipariş oluştururken adres ve ödeme bilgileriniz de işlenir.
            Ödeme bilgileriniz hiçbir zaman sunucularımızda saklanmaz; ödeme altyapı sağlayıcımız
            tarafından işlenir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">2. Verilerin Kullanımı</h2>
          <p>Toplanan veriler yalnızca şu amaçlarla kullanılır:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Siparişlerinizin işlenmesi ve teslim edilmesi</li>
            <li>Müşteri hizmetleri desteği sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Açık onayınız varsa tanıtım e-postaları gönderilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">3. Veri Güvenliği</h2>
          <p>
            Verileriniz SSL/TLS şifrelemeli bağlantılar üzerinden iletilir. Sunucularımız güvenlik
            duvarları ve düzenli denetimlerle korunur. Verileriniz üçüncü taraflarla paylaşılmaz;
            yalnızca kargo firması gibi sipariş sürecinizde zorunlu olan taraflarla minimum düzeyde
            paylaşılır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">4. Çerezler</h2>
          <p>
            Sitemiz oturum yönetimi ve alışveriş sepetinin korunması amacıyla zorunlu çerezler
            kullanır. Analitik amaçlı çerezler kullanılmamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">5. Haklarınız</h2>
          <p>
            KVKK kapsamında verilerinize erişim, düzeltme, silme ve işlemeyi durdurma haklarına
            sahipsiniz. Bu haklarınızı kullanmak için{" "}
            <a href="mailto:info@binbogabal.com.tr" className="text-honey-dark hover:underline">
              info@binbogabal.com.tr
            </a>{" "}
            adresine başvurabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">6. İletişim</h2>
          <p>
            Bu politikayla ilgili sorularınız için:
            <br />
            S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi
            <br />
            E-posta:{" "}
            <a href="mailto:info@binbogabal.com.tr" className="text-honey-dark hover:underline">
              info@binbogabal.com.tr
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Çerez Politikası | Binboğa Bal",
};

export default async function CerezPolitikasiPage() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "contact_email" } });
  const contactEmail = setting?.value ?? "info@binbogabal.com.tr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Çerez Politikası</h1>
      <p className="text-sm text-gray-400 mb-10">Son güncelleme: Ocak 2025</p>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">1. Çerez Nedir?</h2>
          <p>
            Çerezler, ziyaret ettiğiniz web sitelerinin tarayıcınız aracılığıyla cihazınıza
            yerleştirdiği küçük metin dosyalarıdır. Siteyi bir sonraki ziyaretinizde sizi tanımak,
            tercihlerinizi hatırlamak ve kullanıcı deneyimini iyileştirmek amacıyla kullanılırlar.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">2. Kullandığımız Çerez Türleri</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması için gereklidir.
              Oturum yönetimi, sepet ve güvenlik işlevleri bu çerezlerle sağlanır.
              Devre dışı bırakılamazlar.
            </li>
            <li>
              <strong>Tercih Çerezleri:</strong> Dil tercihi ve arayüz ayarları gibi seçimlerinizi
              hatırlar. Bunlar olmadan site temel işlevlerini sürdürür; ancak her ziyarette
              tercihlerinizi yeniden girmeniz gerekebilir.
            </li>
            <li>
              <strong>Analitik Çerezler:</strong> Ziyaretçi sayısı, en çok ziyaret edilen sayfalar
              ve benzer istatistikleri toplayarak siteyi geliştirmemize yardımcı olur. Veriler
              anonim olarak işlenir.
            </li>
            <li>
              <strong>Pazarlama Çerezleri:</strong> İlgi alanlarınıza uygun reklamlar
              gösterebilmek için kullanılır. Bu çerezler yalnızca açık rızanız alındıktan sonra
              etkinleştirilir.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">3. Çerezlerin Kullanım Amaçları</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Güvenli oturum açma ve kimlik doğrulama işlemlerinin yürütülmesi</li>
            <li>Alışveriş sepetinin oturum boyunca korunması</li>
            <li>Site performansının ölçülmesi ve iyileştirilmesi</li>
            <li>Kullanıcı davranışlarının anonim olarak analiz edilmesi</li>
            <li>Açık rıza alınması halinde kişiselleştirilmiş içerik sunulması</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">4. Üçüncü Taraf Çerezler</h2>
          <p>
            Sitemizde ödeme altyapısı ve analitik hizmetleri kapsamında üçüncü taraf çerezler
            kullanılabilir. Bu çerezler ilgili hizmet sağlayıcıların gizlilik politikalarına
            tabidir ve doğrudan bizim kontrolümüzde değildir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">5. Çerezleri Kontrol Etme</h2>
          <p>
            Tarayıcı ayarlarınızdan çerezleri engelleyebilir veya silebilirsiniz. Ancak zorunlu
            çerezlerin devre dışı bırakılması durumunda site işlevlerinin bir kısmı
            (oturum açma, sepet vb.) çalışmayabilir.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve site verileri
            </li>
            <li>
              <strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri
            </li>
            <li>
              <strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri Yönet
            </li>
            <li>
              <strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">6. Yasal Dayanak</h2>
          <p>
            Çerez uygulamalarımız; 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK),
            7253 sayılı Kanun ve ilgili ikincil mevzuat çerçevesinde yürütülmektedir.
            Kişisel verilerinizin işlenmesi hakkında daha fazla bilgi için{" "}
            <a href="/kvkk" className="text-honey-dark hover:underline">
              KVKK Aydınlatma Metni
            </a>
            &apos;ni inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">7. İletişim</h2>
          <p>
            Çerez politikamıza ilişkin sorularınız için{" "}
            <a href={`mailto:${contactEmail}`} className="text-honey-dark hover:underline">
              {contactEmail}
            </a>{" "}
            adresine e-posta gönderebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { LegalDocEditor } from "@/components/admin/LegalDocEditor";

export const metadata = { title: "Hukuki Belgeler | Admin" };

const DEFAULTS: Record<string, string> = {
  legal_kvkk: `<h1>Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</h1>
<p class="date">Son güncelleme: Ocak 2025</p>

<section>
<h2>1. Veri Sorumlusu</h2>
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu sıfatıyla <strong>S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi</strong> ("Kooperatif") tarafından aşağıda açıklanan kapsamda işlenebilecektir.</p>
</section>

<section>
<h2>2. İşlenen Kişisel Veriler</h2>
<ul>
<li>Kimlik bilgileri: Ad, soyad</li>
<li>İletişim bilgileri: E-posta adresi, telefon numarası, posta adresi</li>
<li>Sipariş bilgileri: Satın alınan ürünler, sipariş tarihi, toplam tutar</li>
<li>Oturum bilgileri: IP adresi, tarayıcı türü</li>
</ul>
</section>

<section>
<h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
<ul>
<li>Sipariş süreçlerinin yürütülmesi ve kargo takibinin sağlanması</li>
<li>Müşteri hizmetleri faaliyetlerinin yürütülmesi</li>
<li>Yasal yükümlülüklerin yerine getirilmesi (vergi, muhasebe vb.)</li>
<li>Açık rıza alınması halinde elektronik ticari ileti gönderilmesi</li>
</ul>
</section>

<section>
<h2>4. Kişisel Verilerin Aktarılması</h2>
<p>Kişisel verileriniz; sipariş teslimatı amacıyla kargo firmaları, ödeme işlemleri için ödeme hizmet sağlayıcısı ve yasal zorunluluklar çerçevesinde yetkili kamu kurumları ile paylaşılmaktadır. Üçüncü şahıslarla pazarlama amacıyla paylaşım yapılmamaktadır.</p>
</section>

<section>
<h2>5. Kişisel Veri Sahibinin Hakları</h2>
<p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
<ul>
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
<h2>6. Başvuru</h2>
<p>Haklarınızı kullanmak için <a href="mailto:kvkk@binbogabal.com.tr">kvkk@binbogabal.com.tr</a> adresine e-posta gönderebilir veya yazılı başvurunuzu kooperatif adresimize iletebilirsiniz. Başvurularınız en geç 30 gün içinde sonuçlandırılacaktır.</p>
</section>`,

  legal_mesafeli_satis: `<h1>Mesafeli Satış Sözleşmesi</h1>
<p class="date">6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında hazırlanmıştır.</p>

<section>
<h2>Madde 1 — Taraflar</h2>
<p><strong>SATICI:</strong> S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi, Kozan / Adana | info@binbogabal.com.tr</p>
<p><strong>ALICI:</strong> Ödeme formunda belirtilen ad, soyad ve iletişim bilgilerine sahip kişi.</p>
</section>

<section>
<h2>Madde 2 — Konu</h2>
<p>Bu sözleşme, Alıcı'nın binbogabal.com.tr üzerinden sipariş verdiği ürünlerin satışı ve teslimatına ilişkin olarak 6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerini belirler.</p>
</section>

<section>
<h2>Madde 3 — Teslimat</h2>
<ul>
<li>Ürünler ödeme onayından sonra 1-3 iş günü içinde kargoya verilir.</li>
<li>Kargo süresi ortalama 2-4 iş günüdür.</li>
<li>1.500 TL ve üzeri siparişlerde kargo ücretsizdir.</li>
<li>Ürünler belirtilen adrese teslim edilir; adres hatası alıcıya aittir.</li>
</ul>
</section>

<section>
<h2>Madde 4 — Cayma Hakkı</h2>
<p>Alıcı, teslim tarihinden itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma bildirimi için <a href="mailto:iade@binbogabal.com.tr">iade@binbogabal.com.tr</a> adresine e-posta gönderilmesi yeterlidir.</p>
<p><strong>İstisna:</strong> Açılmış, kullanılmış veya hijyen bozulmuş ürünlerde cayma hakkı kullanılamaz (TKHK Md. 15/1-ğ).</p>
</section>

<section>
<h2>Madde 5 — İade Koşulları</h2>
<ul>
<li>Ürün orijinal ambalajında, açılmamış ve hasarsız olmalıdır.</li>
<li>İade kargo ücreti alıcıya aittir.</li>
<li>Ürün incelendikten sonra iade tutarı 14 iş günü içinde ödenir.</li>
</ul>
</section>

<section>
<h2>Madde 6 — Uyuşmazlık</h2>
<p>Bu sözleşmeden doğan uyuşmazlıklarda Adana Tüketici Hakem Heyeti ve Adana Mahkemeleri yetkilidir. Tüketici şikayetleri için Tüketici Hakem Heyeti'ne başvurulabilir.</p>
</section>`,

  legal_gizlilik: `<h1>Gizlilik Politikası</h1>
<p class="date">Son güncelleme: Ocak 2025</p>

<section>
<h2>1. Toplanan Veriler</h2>
<p>Sitemize üye olduğunuzda ad, soyad, e-posta adresi ve telefon numarası gibi kişisel bilgilerinizi toplarız. Sipariş oluştururken adres ve ödeme bilgileriniz de işlenir. Ödeme bilgileriniz hiçbir zaman sunucularımızda saklanmaz; ödeme altyapı sağlayıcımız tarafından işlenir.</p>
</section>

<section>
<h2>2. Verilerin Kullanımı</h2>
<p>Toplanan veriler yalnızca şu amaçlarla kullanılır:</p>
<ul>
<li>Siparişlerinizin işlenmesi ve teslim edilmesi</li>
<li>Müşteri hizmetleri desteği sağlanması</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Açık onayınız varsa tanıtım e-postaları gönderilmesi</li>
</ul>
</section>

<section>
<h2>3. Veri Güvenliği</h2>
<p>Verileriniz SSL/TLS şifrelemeli bağlantılar üzerinden iletilir. Sunucularımız güvenlik duvarları ve düzenli denetimlerle korunur. Verileriniz üçüncü taraflarla paylaşılmaz; yalnızca kargo firması gibi sipariş sürecinizde zorunlu olan taraflarla minimum düzeyde paylaşılır.</p>
</section>

<section>
<h2>4. Çerezler</h2>
<p>Sitemiz oturum yönetimi ve alışveriş sepetinin korunması amacıyla zorunlu çerezler kullanır. Analitik amaçlı çerezler kullanılmamaktadır.</p>
</section>

<section>
<h2>5. Haklarınız</h2>
<p>KVKK kapsamında verilerinize erişim, düzeltme, silme ve işlemeyi durdurma haklarına sahipsiniz. Bu haklarınızı kullanmak için <a href="mailto:info@binbogabal.com.tr">info@binbogabal.com.tr</a> adresine başvurabilirsiniz.</p>
</section>

<section>
<h2>6. İletişim</h2>
<p>Bu politikayla ilgili sorularınız için:<br>S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi<br>E-posta: <a href="mailto:info@binbogabal.com.tr">info@binbogabal.com.tr</a></p>
</section>`,

  legal_cerez_politikasi: `<h1>Çerez Politikası</h1>
<p class="date">Son güncelleme: Ocak 2025</p>

<section>
<h2>1. Çerez Nedir?</h2>
<p>Çerezler, ziyaret ettiğiniz web sitelerinin tarayıcınız aracılığıyla cihazınıza yerleştirdiği küçük metin dosyalarıdır. Siteyi bir sonraki ziyaretinizde sizi tanımak, tercihlerinizi hatırlamak ve kullanıcı deneyimini iyileştirmek amacıyla kullanılırlar.</p>
</section>

<section>
<h2>2. Kullandığımız Çerez Türleri</h2>
<ul>
<li><strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması için gereklidir. Oturum yönetimi, sepet ve güvenlik işlevleri bu çerezlerle sağlanır. Devre dışı bırakılamazlar.</li>
<li><strong>Tercih Çerezleri:</strong> Dil tercihi ve arayüz ayarları gibi seçimlerinizi hatırlar. Bunlar olmadan site temel işlevlerini sürdürür; ancak her ziyarette tercihlerinizi yeniden girmeniz gerekebilir.</li>
<li><strong>Analitik Çerezler:</strong> Ziyaretçi sayısı, en çok ziyaret edilen sayfalar ve benzer istatistikleri toplayarak siteyi geliştirmemize yardımcı olur. Veriler anonim olarak işlenir.</li>
<li><strong>Pazarlama Çerezleri:</strong> İlgi alanlarınıza uygun reklamlar gösterebilmek için kullanılır. Bu çerezler yalnızca açık rızanız alındıktan sonra etkinleştirilir.</li>
</ul>
</section>

<section>
<h2>3. Çerezlerin Kullanım Amaçları</h2>
<ul>
<li>Güvenli oturum açma ve kimlik doğrulama işlemlerinin yürütülmesi</li>
<li>Alışveriş sepetinin oturum boyunca korunması</li>
<li>Site performansının ölçülmesi ve iyileştirilmesi</li>
<li>Kullanıcı davranışlarının anonim olarak analiz edilmesi</li>
<li>Açık rıza alınması halinde kişiselleştirilmiş içerik sunulması</li>
</ul>
</section>

<section>
<h2>4. Üçüncü Taraf Çerezler</h2>
<p>Sitemizde ödeme altyapısı ve analitik hizmetleri kapsamında üçüncü taraf çerezler kullanılabilir. Bu çerezler ilgili hizmet sağlayıcıların gizlilik politikalarına tabidir ve doğrudan bizim kontrolümüzde değildir.</p>
</section>

<section>
<h2>5. Çerezleri Kontrol Etme</h2>
<p>Tarayıcı ayarlarınızdan çerezleri engelleyebilir veya silebilirsiniz. Ancak zorunlu çerezlerin devre dışı bırakılması durumunda site işlevlerinin bir kısmı (oturum açma, sepet vb.) çalışmayabilir.</p>
<ul>
<li><strong>Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve site verileri</li>
<li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
<li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri Yönet</li>
<li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
</ul>
</section>

<section>
<h2>6. Yasal Dayanak</h2>
<p>Çerez uygulamalarımız; 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), 7253 sayılı Kanun ve ilgili ikincil mevzuat çerçevesinde yürütülmektedir. Kişisel verilerinizin işlenmesi hakkında daha fazla bilgi için <a href="/kvkk">KVKK Aydınlatma Metni</a>'ni inceleyebilirsiniz.</p>
</section>

<section>
<h2>7. İletişim</h2>
<p>Çerez politikamıza ilişkin sorularınız için <a href="mailto:info@binbogabal.com.tr">info@binbogabal.com.tr</a> adresine e-posta gönderebilirsiniz.</p>
</section>`,
};

const DOCS = [
  { key: "legal_kvkk", label: "KVKK" },
  { key: "legal_mesafeli_satis", label: "Mesafeli Satış" },
  { key: "legal_gizlilik", label: "Gizlilik & Güvenlik" },
  { key: "legal_cerez_politikasi", label: "Çerez Politikası" },
];

export default async function HukukiBelgelerPage() {
  await requirePermission("settings", "view");

  const keys = DOCS.map((d) => d.key);
  const dbSettings = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const dbMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));

  const docs = DOCS.map((d) => ({
    key: d.key,
    label: d.label,
    value: dbMap[d.key] ?? DEFAULTS[d.key] ?? "",
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Hukuki Belgeler</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sitede yayınlanan resmi sözleşme ve politika metinlerini düzenleyin. Değişiklikler kaydedildiğinde ilgili sayfalar anında güncellenir.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <LegalDocEditor docs={docs} />
      </div>
    </div>
  );
}

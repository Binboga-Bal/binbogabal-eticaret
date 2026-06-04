import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { processFlowTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Kooperatif Hikayemiz | Binboğa Kooperatif Balı",
  description:
    "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'nin 50 yıllık hikayesi. Kooperatifçiliğin gücü, arıcıların dayanışması.",
};


const chapters = [
  {
    year: "1973",
    title: "Bir Karar, Bir Başlangıç",
    body: "Kozan'ın dağlarında yaşayan birkaç arıcı aile, yalnız başlarına piyasayla başa çıkamadıklarını fark etti. Tüccarlar fiyatı belirliyor, arıcı boyun eğiyordu. İşte o gün masaya oturdu ve S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'ni kurdular. Amaç basitti: emeği koruyan, sömürüye kapı açmayan bir yapı.",
    side: "left",
  },
  {
    year: "1980'ler",
    title: "Kovan Sayısı Artıyor",
    body: "Kooperatif büyüdükçe arıcılar güvende hissetti. İlk ortak ambalajlama tesisi kuruldu. Kozan balının kalitesi bölge dışına çıkmaya başladı. Her yıl onlarca yeni arıcı aile kooperatif çatısı altına sığındı.",
    side: "right",
  },
  {
    year: "1997",
    title: "Dünyaya Açılış",
    body: "İhracat kapısı aralandı. Almanya ve Hollanda'daki Türk toplulukları, Kozan balını sofralarına taşıdı. Bu sadece bir pazar değildi — Toroslar'ın kekik aromasının Avrupa'da tanınmasıydı.",
    side: "left",
  },
  {
    year: "2008",
    title: "Güvenin Belgesi",
    body: "ISO 22000 Gıda Güvenliği sertifikası alındı. Artık kooperatif balını sadece arıcı değil, uluslararası denetçiler de onaylıyordu. Güven kurumsal bir kimliğe kavuştu.",
    side: "right",
  },
  {
    year: "2015",
    title: "1000 Aile, 1000 Umut",
    body: "Üye sayısı 1000'i aştı. Toros dağlarındaki kovanlarda 45 000 koloni. Her kovan bir ailenin geçimini, her aile bir kooperatifin gücünü temsil ediyordu.",
    side: "left",
  },
  {
    year: "2022",
    title: "Altın Mühür",
    body: "London Honey Awards'tan altın ödül geldi. Toroslar'ın çiçek balı dünya sahnesinde boy gösterdi. Ama kooperatif için asıl ödül her zaman arıcıların yüzündeki gülümseme oldu.",
    side: "right",
  },
  {
    year: "2024",
    title: "Arıcıdan Sofranıza",
    body: "E-ticaret platformumuz açıldı. Artık bir tıkla Kozan'dan kapınıza; aracısız, komisyonsuz, sertifikalı. Kooperatifçiliğin ruhunu dijital çağa taşıdık.",
    side: "left",
  },
];

const howItWorks = [
  { step: "01", title: "Arıcı Teslim Eder", desc: "Üye arıcı hasadını doğrudan kooperatif deposuna getirir. Hiçbir aracı el sürmez." },
  { step: "02", title: "Kooperatif Analiz Eder", desc: "Her parti bal Türk Gıda Kodeksi'ne uygun bağımsız laboratuvarda test edilir." },
  { step: "03", title: "Merkezi Ambalajlama", desc: "Testleri geçen bal kooperatifin tesisinde standart kavanozlara doldurulur." },
  { step: "04", title: "Adil Fiyat, Şeffaf Kâr", desc: "Yıl sonunda elde edilen gelir üyelere katılımları oranında paylaştırılır." },
];

const stats = [
  { value: "1973", label: "Kuruluş Yılı" },
  { value: "1800+", label: "Arıcı Üye" },
  { value: "45.000+", label: "Kovan" },
  { value: "50+", label: "Yıllık Deneyim" },
];

export default async function KooperatifHikayemizPage() {
  const bannerSetting = await prisma.siteSetting.findUnique({ where: { key: "banner_kooperatif_hikayemiz" } });
  const bannerImage = bannerSetting?.value ?? null;

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative h-80 md:h-[500px] overflow-hidden bg-gray-900">
        {bannerImage ? (
          <>
            <Image
              src={bannerImage}
              alt="Kooperatif Hikayemiz banner"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17.3 L60 34.7 L30 52 L0 34.7 L0 17.3Z' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 52px",
            }}
          />
        )}
        <div className="relative z-10 h-full flex items-center justify-start">
          <div className="max-w-4xl px-4 sm:px-6 lg:px-8 text-left">
            <span className="inline-block bg-honey-bright/20 text-honey-bright text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Arının Emeği,<br />
              <span className="text-honey-bright">Kooperatifin Güvencesi</span>
            </h1>
            <p className="hidden sm:block text-white/80 text-lg max-w-2xl leading-relaxed">
              1973&apos;te bir avuç arıcının kurduğu bu yapı, bugün 1800&apos;den fazla aileyi
              birbirine bağlıyor. Kâr değil dayanışma; hissedar değil arıcı önce.
            </p>
          </div>
        </div>
      </section>

      {/* ── İSTATİSTİKLER ──────────────────────────────────────────────── */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-black text-honey-dark">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KOOPERATİFÇİLİK NEDİR? ─────────────────────────────────────── */}
      <section className="py-20 bg-honey-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-3">Kooperatifçilik Nedir?</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-snug">
                Şirket değil,<br />ortak akıl
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Kooperatif; ortak ekonomik, sosyal ve kültürel ihtiyaçları karşılamak
                  için gönüllü olarak bir araya gelen insanların oluşturduğu,
                  <strong className="text-gray-800"> demokratik olarak kontrol edilen</strong> bağımsız bir kuruluştur.
                </p>
                <p>
                  Bir şirkette hissedar ne kadar çok pay sahibiyse o kadar çok söz hakkı
                  alır. Kooperatifte ise <strong className="text-gray-800">her üye, sahip olduğu hisse miktarından
                  bağımsız olarak tek oy hakkına sahiptir.</strong> Bu fark her şeyi değiştirir.
                </p>
                <p>
                  Dünya genelinde 3 milyondan fazla kooperatif, 1 milyarın üzerinde
                  üyeyle faaliyet göstermektedir. Türkiye'de ise tarımsal kooperatifler
                  küçük üreticinin en büyük kalkanı olmaya devam ediyor.
                </p>
              </div>
            </div>

            {/* 4 adım grid */}
            <div className="grid grid-cols-2 gap-6">
              {processFlowTheme.steps.map((step) => (
                <div key={step.number} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="relative w-24 h-24">
                    <Image src={step.image} alt={step.title} fill className="object-contain" sizes="96px" />
                  </div>
                  <div>
                    <h3 className="font-bold text-honey-dark text-xs mb-1 leading-snug">{step.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR? ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-3">Süreç</p>
            <h2 className="text-3xl font-black text-gray-900">Kovandan Sofranıza, Adım Adım</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-honey-light z-0" style={{ width: "calc(100% - 2rem)", left: "calc(100% - 1rem)" }} />
                )}
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-honey-dark text-white font-black text-xl mb-5">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARİHSEL YOLCULUK ───────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-3">Tarihimiz</p>
            <h2 className="text-3xl font-black text-gray-900">50 Yılın Hikayesi</h2>
          </div>

          <div className="relative">
            {/* Orta çizgi */}
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-honey-light hidden md:block" />

            <div className="space-y-12">
              {chapters.map((c, i) => (
                <div
                  key={c.year}
                  className={`md:flex items-start gap-8 ${c.side === "right" ? "md:flex-row-reverse" : ""}`}
                >
                  {/* İçerik kutusu */}
                  <div className="flex-1 md:max-w-[calc(50%-2rem)]">
                    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${c.side === "right" ? "md:ml-8" : "md:mr-8"}`}>
                      <span className="inline-block bg-honey-dark text-white text-xs font-black px-3 py-1 rounded-full mb-3">
                        {c.year}
                      </span>
                      <h3 className="font-black text-gray-900 text-lg mb-2">{c.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                    </div>
                  </div>

                  {/* Orta nokta */}
                  <div className="hidden md:flex flex-shrink-0 w-4 h-4 rounded-full bg-honey-dark border-4 border-white shadow mt-6 relative z-10" />

                  {/* Boş taraf */}
                  <div className="flex-1 md:max-w-[calc(50%-2rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ARICILAR KONUŞUYOR ──────────────────────────────────────────── */}
      <section className="py-20 bg-honey-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-honey-bright font-bold text-sm uppercase tracking-widest mb-3">Sesler</p>
            <h2 className="text-3xl font-black text-white">Onlar Anlatsın</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Kooperatif olmasaydı, balam için istediğim fiyatı alamazdım. Şimdi hasat sonunda ne alacağımı biliyorum.",
                name: "Mehmet Demir",
                detail: "22 yıllık üye, Kozan",
              },
              {
                quote: "Tek başıma laboratuvar analizi yaptıramazdım. Kooperatif hem kaliteyi hem de güveni getirdi.",
                name: "Hatice Şahin",
                detail: "15 yıllık üye, Feke",
              },
              {
                quote: "Babamdan kalan 40 kovanı kooperatife bağladım. Artık çocuklarıma bu mesleği öğretmekten çekinmiyorum.",
                name: "Ali Öztürk",
                detail: "8 yıllık üye, Saimbeyli",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="text-honey-bright text-4xl font-serif mb-4">&ldquo;</div>
                <p className="text-white/90 text-sm leading-relaxed mb-6">{t.quote}</p>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-honey-bright/70 text-xs">{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-6">Neden Biz?</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-snug mb-8">
            Bir ürün almıyorsunuz.<br />
            <span className="text-honey-dark">Bir sistemi destekliyorsunuz.</span>
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-left bg-honey-cream rounded-2xl p-8">
            <p>
              Her kavanozu satın aldığınızda, Kozan'daki bir arıcı ailesine adil fiyat ödeniyor.
              Hiçbir aracı komisyon almıyor. Kooperatif yönetim kurulu gönüllü üyelerden oluşuyor.
            </p>
            <p>
              Bu, <strong>sanayileşmiş bal endüstrisine karşı küçük bir direniş.</strong> Arının emeğine
              saygının, toprağa bağlılığın ve insanlar arası güvenin sembolü.
            </p>
            <p>
              Siz her sipariş verdiğinizde 1973'teki o ilk kararı güçlendiriyorsunuz:
              <em> birlikte daha güçlüyüz.</em>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-honey-cream border-t border-honey-light">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Kooperatif balını keşfedin
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Arıcıdan sofranıza — aracısız, analiz sertifikalı, kooperatif güvenceli.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/urunlerimiz"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 bg-honey-dark text-white font-bold rounded-2xl hover:bg-honey-medium transition-colors"
            >
              Ürünlerimizi İncele →
            </Link>
            <Link
              href="/hakkimizda"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-honey-dark text-honey-dark font-bold rounded-2xl hover:bg-honey-dark hover:text-white transition-colors"
            >
              Hakkımızda
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

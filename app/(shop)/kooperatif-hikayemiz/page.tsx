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

// ── Varsayılan içerikler ────────────────────────────────────────────────────
const D = {
  hero_badge: "S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi",
  hero_h1_line1: "Arının Emeği,",
  hero_h1_line2: "Kooperatifin Güvencesi",
  hero_subtitle:
    "1973'te bir avuç arıcının kurduğu bu yapı, bugün 1800'den fazla aileyi birbirine bağlıyor. Kâr değil dayanışma; hissedar değil arıcı önce.",

  stat_1_value: "1973",    stat_1_label: "Kuruluş Yılı",
  stat_2_value: "1800+",   stat_2_label: "Arıcı Üye",
  stat_3_value: "45.000+", stat_3_label: "Kovan",
  stat_4_value: "50+",     stat_4_label: "Yıllık Deneyim",

  coop_tag: "Kooperatifçilik Nedir?",
  coop_heading: "Şirket değil, ortak akıl",
  coop_p1: "Kooperatif; ortak ekonomik, sosyal ve kültürel ihtiyaçları karşılamak için gönüllü olarak bir araya gelen insanların oluşturduğu, demokratik olarak kontrol edilen bağımsız bir kuruluştur.",
  coop_p2: "Bir şirkette hissedar ne kadar çok pay sahibiyse o kadar çok söz hakkı alır. Kooperatifte ise her üye, sahip olduğu hisse miktarından bağımsız olarak tek oy hakkına sahiptir. Bu fark her şeyi değiştirir.",
  coop_p3: "Dünya genelinde 3 milyondan fazla kooperatif, 1 milyarın üzerinde üyeyle faaliyet göstermektedir. Türkiye'de ise tarımsal kooperatifler küçük üreticinin en büyük kalkanı olmaya devam ediyor.",

  process_tag: "Süreç",
  process_heading: "Kovandan Sofranıza, Adım Adım",
  process_1_step: "01", process_1_title: "Arıcı Teslim Eder",
  process_1_desc: "Üye arıcı hasadını doğrudan kooperatif deposuna getirir. Hiçbir aracı el sürmez.",
  process_2_step: "02", process_2_title: "Kooperatif Analiz Eder",
  process_2_desc: "Her parti bal Türk Gıda Kodeksi'ne uygun bağımsız laboratuvarda test edilir.",
  process_3_step: "03", process_3_title: "Merkezi Ambalajlama",
  process_3_desc: "Testleri geçen bal kooperatifin tesisinde standart kavanozlara doldurulur.",
  process_4_step: "04", process_4_title: "Adil Fiyat, Şeffaf Kâr",
  process_4_desc: "Yıl sonunda elde edilen gelir üyelere katılımları oranında paylaştırılır.",

  history_tag: "Tarihimiz",
  history_heading: "50 Yılın Hikayesi",
  chapter_1_year: "1973",    chapter_1_title: "Bir Karar, Bir Başlangıç",
  chapter_1_body: "Kozan'ın dağlarında yaşayan birkaç arıcı aile, yalnız başlarına piyasayla başa çıkamadıklarını fark etti. Tüccarlar fiyatı belirliyor, arıcı boyun eğiyordu. İşte o gün masaya oturdu ve S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi'ni kurdular. Amaç basitti: emeği koruyan, sömürüye kapı açmayan bir yapı.",
  chapter_2_year: "1980'ler", chapter_2_title: "Kovan Sayısı Artıyor",
  chapter_2_body: "Kooperatif büyüdükçe arıcılar güvende hissetti. İlk ortak ambalajlama tesisi kuruldu. Kozan balının kalitesi bölge dışına çıkmaya başladı. Her yıl onlarca yeni arıcı aile kooperatif çatısı altına sığındı.",
  chapter_3_year: "1997",    chapter_3_title: "Dünyaya Açılış",
  chapter_3_body: "İhracat kapısı aralandı. Almanya ve Hollanda'daki Türk toplulukları, Kozan balını sofralarına taşıdı. Bu sadece bir pazar değildi — Toroslar'ın kekik aromasının Avrupa'da tanınmasıydı.",
  chapter_4_year: "2008",    chapter_4_title: "Güvenin Belgesi",
  chapter_4_body: "ISO 22000 Gıda Güvenliği sertifikası alındı. Artık kooperatif balını sadece arıcı değil, uluslararası denetçiler de onaylıyordu. Güven kurumsal bir kimliğe kavuştu.",
  chapter_5_year: "2015",    chapter_5_title: "1000 Aile, 1000 Umut",
  chapter_5_body: "Üye sayısı 1000'i aştı. Toros dağlarındaki kovanlarda 45 000 koloni. Her kovan bir ailenin geçimini, her aile bir kooperatifin gücünü temsil ediyordu.",
  chapter_6_year: "2022",    chapter_6_title: "Altın Mühür",
  chapter_6_body: "London Honey Awards'tan altın ödül geldi. Toroslar'ın çiçek balı dünya sahnesinde boy gösterdi. Ama kooperatif için asıl ödül her zaman arıcıların yüzündeki gülümseme oldu.",
  chapter_7_year: "2024",    chapter_7_title: "Arıcıdan Sofranıza",
  chapter_7_body: "E-ticaret platformumuz açıldı. Artık bir tıkla Kozan'dan kapınıza; aracısız, komisyonsuz, sertifikalı. Kooperatifçiliğin ruhunu dijital çağa taşıdık.",

  voices_tag: "Sesler",
  voices_heading: "Onlar Anlatsın",
  voice_1_quote: "Kooperatif olmasaydı, balam için istediğim fiyatı alamazdım. Şimdi hasat sonunda ne alacağımı biliyorum.",
  voice_1_name: "Mehmet Demir", voice_1_detail: "22 yıllık üye, Kozan",
  voice_2_quote: "Tek başıma laboratuvar analizi yaptıramazdım. Kooperatif hem kaliteyi hem de güveni getirdi.",
  voice_2_name: "Hatice Şahin", voice_2_detail: "15 yıllık üye, Feke",
  voice_3_quote: "Babamdan kalan 40 kovanı kooperatife bağladım. Artık çocuklarıma bu mesleği öğretmekten çekinmiyorum.",
  voice_3_name: "Ali Öztürk",   voice_3_detail: "8 yıllık üye, Saimbeyli",

  manifesto_tag: "Neden Biz?",
  manifesto_heading_1: "Bir ürün almıyorsunuz.",
  manifesto_heading_2: "Bir sistemi destekliyorsunuz.",
  manifesto_p1: "Her kavanozu satın aldığınızda, Kozan'daki bir arıcı ailesine adil fiyat ödeniyor. Hiçbir aracı komisyon almıyor. Kooperatif yönetim kurulu gönüllü üyelerden oluşuyor.",
  manifesto_p2: "Bu, sanayileşmiş bal endüstrisine karşı küçük bir direniş. Arının emeğine saygının, toprağa bağlılığın ve insanlar arası güvenin sembolü.",
  manifesto_p3: "Siz her sipariş verdiğinizde 1973'teki o ilk kararı güçlendiriyorsunuz: birlikte daha güçlüyüz.",

  cta_heading: "Kooperatif balını keşfedin",
  cta_text: "Arıcıdan sofranıza — aracısız, analiz sertifikalı, kooperatif güvenceli.",
  cta_btn_1: "Ürünlerimizi İncele →",
  cta_btn_2: "Hakkımızda",
} as const;

const PFX = "page_koophistory_";
const ALL_KEYS = [...(Object.keys(D) as (keyof typeof D)[]).map((k) => `${PFX}${k}`), "banner_kooperatif_hikayemiz"];

function t(db: Record<string, string>, key: keyof typeof D): string {
  return db[`${PFX}${key}`] || D[key];
}

export default async function KooperatifHikayemizPage() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const db = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const bannerImage = db.banner_kooperatif_hikayemiz ?? null;

  const stats = [1, 2, 3, 4].map((i) => ({
    value: t(db, `stat_${i}_value` as keyof typeof D),
    label: t(db, `stat_${i}_label` as keyof typeof D),
  }));

  const howItWorks = [1, 2, 3, 4].map((i) => ({
    step:  t(db, `process_${i}_step`  as keyof typeof D),
    title: t(db, `process_${i}_title` as keyof typeof D),
    desc:  t(db, `process_${i}_desc`  as keyof typeof D),
  }));

  const chapters = [1, 2, 3, 4, 5, 6, 7].map((i, idx) => ({
    year:  t(db, `chapter_${i}_year`  as keyof typeof D),
    title: t(db, `chapter_${i}_title` as keyof typeof D),
    body:  t(db, `chapter_${i}_body`  as keyof typeof D),
    side: idx % 2 === 0 ? "left" : "right",
  }));

  const voices = [1, 2, 3].map((i) => ({
    quote:  t(db, `voice_${i}_quote`  as keyof typeof D),
    name:   t(db, `voice_${i}_name`   as keyof typeof D),
    detail: t(db, `voice_${i}_detail` as keyof typeof D),
  }));

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative h-80 md:h-[500px] xl:h-[560px] 2xl:h-[620px] 3xl:h-[680px] 4xl:h-[760px] overflow-hidden bg-honey-cream">
        {bannerImage ? (
          <>
            <Image src={bannerImage} alt="Kooperatif Hikayemiz banner" fill sizes="100vw" className="object-cover" priority />
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
              {t(db, "hero_badge")}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t(db, "hero_h1_line1")}<br />
              <span className="text-honey-bright">{t(db, "hero_h1_line2")}</span>
            </h1>
            <p className="hidden sm:block text-white/80 text-lg max-w-2xl leading-relaxed">
              {t(db, "hero_subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── İSTATİSTİKLER ─────────────────────────────────────────────────── */}
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

      {/* ── KOOPERATİFÇİLİK NEDİR? ────────────────────────────────────────── */}
      <section className="py-20 bg-honey-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-3">{t(db, "coop_tag")}</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-snug">{t(db, "coop_heading")}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t(db, "coop_p1")}</p>
                <p>{t(db, "coop_p2")}</p>
                <p>{t(db, "coop_p3")}</p>
              </div>
            </div>
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

      {/* ── NASIL ÇALIŞIR? ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-3">{t(db, "process_tag")}</p>
            <h2 className="text-3xl font-black text-gray-900">{t(db, "process_heading")}</h2>
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

      {/* ── TARİHSEL YOLCULUK ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-3">{t(db, "history_tag")}</p>
            <h2 className="text-3xl font-black text-gray-900">{t(db, "history_heading")}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-honey-light hidden md:block" />
            <div className="space-y-12">
              {chapters.map((c) => (
                <div key={c.year} className={`md:flex items-start gap-8 ${c.side === "right" ? "md:flex-row-reverse" : ""}`}>
                  <div className="flex-1 md:max-w-[calc(50%-2rem)]">
                    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${c.side === "right" ? "md:ml-8" : "md:mr-8"}`}>
                      <span className="inline-block bg-honey-dark text-white text-xs font-black px-3 py-1 rounded-full mb-3">{c.year}</span>
                      <h3 className="font-black text-gray-900 text-lg mb-2">{c.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-shrink-0 w-4 h-4 rounded-full bg-honey-dark border-4 border-white shadow mt-6 relative z-10" />
                  <div className="flex-1 md:max-w-[calc(50%-2rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ARICILAR KONUŞUYOR ─────────────────────────────────────────────── */}
      <section className="py-20 bg-honey-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-honey-bright font-bold text-sm uppercase tracking-widest mb-3">{t(db, "voices_tag")}</p>
            <h2 className="text-3xl font-black text-white">{t(db, "voices_heading")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {voices.map((v) => (
              <div key={v.name} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <div className="text-honey-bright text-4xl font-serif mb-4">&ldquo;</div>
                <p className="text-white/90 text-sm leading-relaxed mb-6">{v.quote}</p>
                <div>
                  <div className="font-bold text-white text-sm">{v.name}</div>
                  <div className="text-honey-bright/70 text-xs">{v.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANİFESTO ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-honey-dark font-bold text-sm uppercase tracking-widest mb-6">{t(db, "manifesto_tag")}</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-snug mb-8">
            {t(db, "manifesto_heading_1")}<br />
            <span className="text-honey-dark">{t(db, "manifesto_heading_2")}</span>
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-left bg-honey-cream rounded-2xl p-8">
            <p>{t(db, "manifesto_p1")}</p>
            <p>{t(db, "manifesto_p2")}</p>
            <p>{t(db, "manifesto_p3")}</p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-honey-cream border-t border-honey-light">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">{t(db, "cta_heading")}</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">{t(db, "cta_text")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/urunlerimiz" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 bg-honey-dark text-white font-bold rounded-2xl hover:bg-honey-medium transition-colors">
              {t(db, "cta_btn_1")}
            </Link>
            <Link href="/hakkimizda" className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-honey-dark text-honey-dark font-bold rounded-2xl hover:bg-honey-dark hover:text-white transition-colors">
              {t(db, "cta_btn_2")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";

const steps = [
  {
    number: 1,
    title: "ÜRETİCİ İÇİN ADİL MODEL",
    description:
      "Arıcılarımıza adil fiyat ve öncelikli gelir güvencesi sunuyoruz. Arıcılar ortaklardan oluşur, üreticilerin kooperatif ağına dahil olması ve rekabetçi fiyatlarla kazanmalarını sağlarız.",
    image: "/images/home-screen/second-infographics/uretici-icin-adil-model.webp",
  },
  {
    number: 2,
    title: "KALİTE İÇİN KONTROL",
    description:
      "Her parti bal, çok aşamalı kalite denetimlerinden geçer. Akredite laboratuvarlarda analizden geçer, uluslararası standartlara uygunluğu garanti eder.",
    image: "/images/home-screen/second-infographics/kalite-icin-kontrol.webp",
  },
  {
    number: 3,
    title: "TÜKETİCİ İÇİN GÜVEN",
    description:
      "Hangi bölgeden, hangi taşıyıcıyla ve ne kadar hijyenik üretildiğine dair tam bilgi. Şeffaflık ve güven, marka bağlılığını sağlar.",
    image: "/images/home-screen/second-infographics/tuketici-icin-guven.webp",
  },
  {
    number: 4,
    title: "GELECEK İÇİN SÜRDÜRÜLEBİLİRLİK",
    description:
      "Doğal arıcılık, organik üretim ve geleceğe duyarlı uygulamalarla ekoloji sistemini koruyoruz. Doğaya saygılı, biyoçeşitlilik destekleyen gelecek nesiller için dünya bırakıyoruz.",
    image: "/images/home-screen/second-infographics/gelecek-icin-surdurebilirlik.webp",
  },
];

/**
 * Bal peteği (flat-top hexagon) clip-path.
 * Gerçek petek hücresi yönü: üst ve alt kenar düz, yan köşeler sivri.
 *   polygon: sol-üst → sağ-üst → sağ → sağ-alt → sol-alt → sol
 */
const HEXAGON_CLIP = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

export function ProcessFlow() {
  return (
    <section className="py-16 bg-honey-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-14">
          KOOPERATİF DİREK ÜRETİCİDEN ANALİZİ YAPILMIŞ BAL ALMAK DEMEK...
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">

              {/* Adımlar arası bağlantı çizgisi (masaüstü) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-honey-medium/40 z-0 -translate-x-1/2" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center gap-4">

                {/* ── Bal peteği step number ────────────────────────────── */}
                <div
                  className="flex items-center justify-center bg-honey-dark text-white font-black text-base flex-shrink-0 select-none"
                  style={{
                    width:    56,
                    height:   56,
                    clipPath: HEXAGON_CLIP,
                  }}
                >
                  {step.number}
                </div>

                {/* ── İnfografik görsel ─────────────────────────────────── */}
                <div className="relative w-36 h-36 md:w-44 md:h-44">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain drop-shadow-sm"
                    sizes="(max-width: 768px) 144px, 176px"
                  />
                </div>

                {/* ── Metin ─────────────────────────────────────────────── */}
                <div>
                  <h3 className="text-sm font-bold text-honey-dark mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

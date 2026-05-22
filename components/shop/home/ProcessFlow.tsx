const steps = [
  {
    number: 1,
    title: "ÜRETİCİ İÇİN ADİL MODEL",
    description:
      "Arıcılarımıza adil fiyat ve öncelikli gelir güvencesi sunuyoruz. Arıcılar ortaklardan oluşur, üreticilerin kooperatif ağına dahil olması ve rekabetçi fiyatlarla kazanmalarını sağlarız.",
    icon: "👨‍🌾",
  },
  {
    number: 2,
    title: "KALİTE İÇİN KONTROL",
    description:
      "Her parti bal, çok aşamalı kalite denetimlerinden geçer. Akredite laboratuvarlarda analizden geçer, uluslararası standartlara uygunluğu garanti eder.",
    icon: "🔬",
  },
  {
    number: 3,
    title: "TÜKETİCİ İÇİN GÜVEN",
    description:
      "Hangi bölgeden, hangi taşıyıcıyla ve ne kadar hijyenik üretildiğine dair tam bilgi. Şeffaflık ve güven, marka bağlılığını sağlar.",
    icon: "🛡️",
  },
  {
    number: 4,
    title: "GELECEK İÇİN SÜRDÜRÜLEBİLİRLİK",
    description:
      "Doğal arıcılık, organik üretim ve geleceğe duyarlı uygulamalarla ekoloji sistemini koruyoruz. Doğaya saygılı, biyoçeşitlilik destekleyen gelecek nesiller için dünya bırakıyoruz.",
    icon: "🌱",
  },
];

export function ProcessFlow() {
  return (
    <section className="py-16 bg-honey-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-12">
          KOOPERATİF DİREK ÜRETİCİDEN ANALİZİ YAPILMIŞ BAL ALMAK DEMEK...
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-honey-medium/40 z-0 -translate-x-1/2" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-honey-dark text-white flex items-center justify-center text-xl font-black mb-4">
                  {step.number}
                </div>
                <span className="text-2xl mb-2">{step.icon}</span>
                <h3 className="text-sm font-bold text-honey-dark mb-2">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

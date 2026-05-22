const badges = [
  {
    icon: "🐝",
    title: "1700+ Arıcı Bası",
    description: "Kooperatifin ortaklarından üretilen bal",
  },
  {
    icon: "🔬",
    title: "Güvenilir Bal",
    description: "Akredite laboratuvarlarda analizden geçer",
  },
  {
    icon: "📦",
    title: "Özenli Paketleme",
    description: "Binboğa'nın kalite standartlarıyla ambalajlanır",
  },
  {
    icon: "🚚",
    title: "Hızlı Teslimat",
    description: "Aynı gün kargoya verilen siparişler",
  },
];

export function TrustBadges() {
  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-start gap-3">
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-800">{badge.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

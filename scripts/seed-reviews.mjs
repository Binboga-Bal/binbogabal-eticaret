import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_REVIEWS = [
  { name: "Ayşe Yılmaz",   rating: 5, comment: "Gerçekten doğal bir bal. Tadı ve kıvamı mükemmel, marketten aldıklarımızla kıyaslanamaz. Her sabah kahvaltıda kullanıyoruz, aile olarak çok beğendik." },
  { name: "Mehmet Kaya",   rating: 5, comment: "Kooperatiften alınan balın farkı belli oluyor. İçinden çıktığında kokusu bile bambaşka. Kesinlikle tavsiye ederim, ikinci siparişimi de verdim." },
  { name: "Fatma Demir",   rating: 4, comment: "Bal çok lezzetli ve doğal olduğu belli. Tek eksiği kargo biraz geç geldi ama ürün harika. Bir sonraki siparişimi zaten oluşturdum." },
  { name: "Hasan Çelik",   rating: 5, comment: "Toroslar'ın çiçek balı bu kadar güzel olabilir mi? Rengi, kokusu ve tadı eşsiz. Ailecek çok sevdik, özellikle çocuklar bayıldı." },
  { name: "Zeynep Arslan", rating: 5, comment: "Yıllardır kooperatif balı kullanıyorum, kaliteden hiç ödün vermiyorlar. Bu sefer de beklentilerimi karşıladı. Paketleme de özenli geldi." },
  { name: "Ali Öztürk",    rating: 4, comment: "Bal güzel, doğal olduğu kesin. Biraz daha sıvı kıvamda olmasını tercih ederdim ama tat olarak çok başarılı. Fiyat/performans oranı harika." },
  { name: "Elif Şahin",    rating: 5, comment: "Annem için sipariş ettim, çok beğendi. 'Bu gerçek bal' dedi. Aromatik kokusu odaya yayılıyor. Bir dahaki seferinde daha büyük boy alacağım." },
];

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  if (!products.length) {
    console.log("Aktif ürün bulunamadı.");
    return;
  }

  // Tüm örnek kullanıcıları oluştur
  const users = await Promise.all(
    SAMPLE_REVIEWS.map((r) =>
      prisma.user.upsert({
        where: { email: `${r.name.toLowerCase().replace(/\s+/g, ".").replace(/[ğ]/g,"g").replace(/[ş]/g,"s").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ü]/g,"u").replace(/[ç]/g,"c")}@example.com` },
        create: {
          email: `${r.name.toLowerCase().replace(/\s+/g, ".").replace(/[ğ]/g,"g").replace(/[ş]/g,"s").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ü]/g,"u").replace(/[ç]/g,"c")}@example.com`,
          name: r.name,
          role: "CUSTOMER",
        },
        update: { name: r.name },
      })
    )
  );

  // Her ürün için yorumları ekle
  let total = 0;
  for (const product of products) {
    for (let i = 0; i < SAMPLE_REVIEWS.length; i++) {
      const sample = SAMPLE_REVIEWS[i];
      const user = users[i];

      const existing = await prisma.review.findFirst({
        where: { productId: product.id, userId: user.id },
      });
      if (existing) continue;

      // Tarihleri dağıt (son 6 ay)
      const daysAgo = Math.floor(Math.random() * 180);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      await prisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: sample.rating,
          comment: sample.comment,
          isApproved: true,
          createdAt,
        },
      });
      total++;
    }
  }

  console.log(`${total} yorum eklendi (${products.length} ürün).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

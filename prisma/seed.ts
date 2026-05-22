import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Admin kullanıcı
  const hashedPassword = await bcrypt.hash("admin123456", 12);
  await prisma.user.upsert({
    where: { email: "admin@binbogabal.com.tr" },
    create: {
      email: "admin@binbogabal.com.tr",
      name: "Admin Kullanıcı",
      password: hashedPassword,
      role: "SUPERADMIN",
    },
    update: {},
  });
  console.log("✅ Admin kullanıcı oluşturuldu");

  // Kategoriler
  const cicekSeri = await prisma.category.upsert({
    where: { slug: "kooperatif-cicek-serisi" },
    create: {
      name: "Kooperatif Çiçek Serisi",
      slug: "kooperatif-cicek-serisi",
      order: 1,
      isActive: true,
    },
    update: {},
  });

  const gurmeSeri = await prisma.category.upsert({
    where: { slug: "kooperatif-gurme-serisi" },
    create: {
      name: "Kooperatif Gurme Serisi",
      slug: "kooperatif-gurme-serisi",
      order: 2,
      isActive: true,
    },
    update: {},
  });

  const kidsSeri = await prisma.category.upsert({
    where: { slug: "kooperatif-kids-serisi" },
    create: {
      name: "Kooperatif Kids Serisi",
      slug: "kooperatif-kids-serisi",
      order: 3,
      isActive: true,
    },
    update: {},
  });
  console.log("✅ Kategoriler oluşturuldu");

  // Ürün: Çiçek Balı
  const cicekBali = await prisma.product.upsert({
    where: { slug: "binboga-cicek-bali" },
    create: {
      name: "Binboğa Çiçek Balı",
      slug: "binboga-cicek-bali",
      shortDescription: "Toroslar'ın yüksek yaylalarında yetişen çiçeklerden elde edilen doğal bal.",
      description: `<h3>Çiçek Balı</h3>
<p>Kooperatif Balı Binboğa Süzme Çiçek Balı; Toroslar'ın yüksek yaylalarında, zengin bitki örtüsüne sahip doğal alanlarda yetişen çiçeklerden elde edilmektedir.</p>
<p>Türkiye'nin eşsiz çiçek florasına doğal olarak yetişen çiçeklerin nektarlarından üretilen Kooperatif Balı Binboğa Süzme Çiçek Balı 450 g, kalite ve güvenilirlik analizlerinden geçirilerek S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi tesislerinde kavanozlanmaktadır.</p>
<p><em>Arının emeği, arıcının sabrı, kooperatifin güvencesi.</em></p>
<h4>Kooperatif Balı Binboğa Süzme Çiçek Balı Ne İşe Yarar?</h4>
<p>Kooperatif Balı Binboğa Süzme Çiçek Balı, günlük enerji ihtiyacını destekleyebilecek doğal ve lezzetli bir besin alternatifidir.</p>`,
      images: ["/images/products/cicek-bali.jpg"],
      categoryId: cicekSeri.id,
      honeyType: "CICEK",
      isActive: true,
      isBestseller: true,
      isFeatured: true,
    },
    update: {},
  });

  const sizes = [
    { size: 225, price: 1500, discountedPrice: 1125 },
    { size: 325, price: 2000, discountedPrice: 1500 },
    { size: 450, price: 2800, discountedPrice: 2100 },
    { size: 850, price: 5000, discountedPrice: 3750 },
    { size: 1000, price: 5800, discountedPrice: 4350 },
    { size: 1500, price: 8500, discountedPrice: 6375 },
    { size: 2000, price: 11000, discountedPrice: 8250 },
  ];

  for (const s of sizes) {
    await prisma.productVariant.upsert({
      where: { sku: `CICEK-GLASS-${s.size}` },
      create: {
        productId: cicekBali.id,
        size: s.size,
        packagingType: "GLASS",
        price: s.price,
        discountedPrice: s.discountedPrice,
        stock: 50,
        sku: `CICEK-GLASS-${s.size}`,
      },
      update: { price: s.price, discountedPrice: s.discountedPrice },
    });
  }
  console.log("✅ Çiçek Balı ürünü oluşturuldu");

  // FAQ
  const faqs = [
    {
      question: "Kooperatif nedir?",
      answer: "Kooperatif, ortak ekonomik, sosyal ve kültürel çıkarlarını gerçekleştirmek amacıyla gönüllü olarak bir araya gelen kişilerin oluşturduğu, demokratik olarak kontrol edilen bir ortaklık işletmesidir.",
      order: 1,
    },
    {
      question: "Ürünlerimiz katkısız mı?",
      answer: "Evet. Tüm ürünlerimiz akredite laboratuvarlarda analiz edilmekte ve herhangi bir katkı maddesi içermediği güvence altına alınmaktadır.",
      order: 2,
    },
    {
      question: "Teslimat süreniz?",
      answer: "Siparişleriniz genellikle 1-3 iş günü içinde kargoya verilmektedir. Kargo süreci taşıyıcı firmaya göre değişmekle birlikte ortalama 2-5 iş günüdür.",
      order: 3,
    },
    {
      question: "Ürünlerimize katkı var mı?",
      answer: "Hayır. Kooperatif Balı Binboğa ürünleri tamamen doğal olup herhangi bir katkı maddesi, şeker veya yapay tatlandırıcı içermemektedir.",
      order: 4,
    },
    {
      question: "Ürünleriniz bal mumu?",
      answer: "Evet, arı mumu ürünlerimiz de mevcuttur. Ürün kategorilerimizden inceleyebilirsiniz.",
      order: 5,
    },
    {
      question: "Glütenimiz aktörimiz?",
      answer: "Ürünlerimiz doğal bal olup glüten içermemektedir. Ancak üretim tesisimizde farklı ürünler de işlenmektedir. Ciddi alerjisi olan müşterilerimizin bizi araması önerilir.",
      order: 6,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: `faq-${faq.order}` },
      create: { ...faq, id: `faq-${faq.order}` },
      update: { answer: faq.answer },
    });
  }
  console.log("✅ FAQ'lar oluşturuldu");

  // Blog
  await prisma.blogPost.upsert({
    where: { slug: "gercek-bal-nasil-anlasilir" },
    create: {
      title: "Gerçek Bal Nasıl Anlaşılır?",
      slug: "gercek-bal-nasil-anlasilir",
      excerpt: "1973 yılında, Adana'nın Kozan ilçesinde birkaç arıcı aile bir karar verdi. Tek başına ayakta kalmanın zor olduğunu biliyorlardı. Çünkü bal sadece doğanın değil, sabrın da işiydi.",
      content: `<h2>Gerçek Bal Nasıl Anlaşılır?</h2>
<p>1973 yılında, Adana'nın Kozan ilçesinde birkaç arıcı aile bir karar verdi. Tek başına ayakta kalmanın zor olduğunu biliyorlardı. Çünkü bal sadece doğanın değil, sabrın da işiydi. Yağmurun erken yağması, kuraklığın uzaması, piyasanın dengesizliği... Hepsi küçük üreticinin omzuna yük oluyordu.</p>
<p>İşte o gün, yükü paylaşmak için bir araya geldiler. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi böyle doğdu.</p>`,
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  });
  console.log("✅ Blog yazısı oluşturuldu");

  console.log("🎉 Seed tamamlandı!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

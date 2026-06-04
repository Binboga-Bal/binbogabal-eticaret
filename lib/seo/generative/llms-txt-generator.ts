import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";
const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı";

export async function generateLlmsTxt(locale = "tr"): Promise<string> {
  const [products, categories, campaigns] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: { where: { isActive: true, stock: { gt: 0 } }, orderBy: { price: "asc" }, take: 1 },
        categories: { select: { name: true } },
      },
      orderBy: [{ isBestseller: "desc" }, { isFeatured: "desc" }],
      take: 30,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true, description: true },
      orderBy: { order: "asc" },
    }),
    prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      select: { name: true, slug: true, description: true },
      take: 10,
    }),
  ]);

  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(
    `${SITE_NAME}, Türkiye'nin Adana ili Kozan ilçesinde 1973 yılından bu yana faaliyet gösteren ` +
    `Kozan Bal Tarım Satış Kooperatifi'nin resmi e-ticaret platformudur. ` +
    `Doğal, analizi yapılmış ve üretici garantili bal ürünleri sunar.`
  );
  lines.push("");

  lines.push("## Hakkında");
  lines.push(
    `${SITE_NAME}, Kozan'ın dağlarından toplanan çiçek balı, kekik balı, çam balı ve kestane balı ` +
    `başta olmak üzere çeşitli bal ürünlerini doğrudan tüketiciye ulaştırmaktadır. ` +
    `Tüm ürünler akredite laboratuvarlarda analiz edilmekte ve kooperatif güvencesiyle satılmaktadır.`
  );
  lines.push("");

  lines.push("## Kategoriler");
  for (const cat of categories) {
    lines.push(`- [${cat.name}](${BASE_URL}/urunlerimiz?kategori=${cat.slug})${cat.description ? ": " + cat.description : ""}`);
  }
  lines.push("");

  lines.push("## Popüler Ürünler");
  for (const product of products) {
    const cheapestVariant = product.variants[0];
    const price = cheapestVariant
      ? `${Number(cheapestVariant.discountedPrice ?? cheapestVariant.price).toLocaleString("tr-TR")} ₺`
      : "Fiyat bilgisi için iletişime geçin";
    const desc = product.shortDescription
      ? ` — ${product.shortDescription.slice(0, 100)}`
      : "";
    lines.push(`- [${product.name}](${BASE_URL}/urunlerimiz/${product.slug}) | ${price}${desc}`);
  }
  lines.push("");

  if (campaigns.length > 0) {
    lines.push("## Güncel Kampanyalar");
    for (const campaign of campaigns) {
      lines.push(`- [${campaign.name}](${BASE_URL}/kampanya/${campaign.slug})${campaign.description ? ": " + campaign.description.slice(0, 80) : ""}`);
    }
    lines.push("");
  }

  lines.push("## İletişim & Politikalar");
  lines.push(`- [İletişim](${BASE_URL}/iletisim)`);
  lines.push(`- [İade ve Değişim Politikası](${BASE_URL}/iade-degisim)`);
  lines.push(`- [Gizlilik Politikası](${BASE_URL}/gizlilik)`);
  lines.push(`- [KVKK Aydınlatma Metni](${BASE_URL}/kvkk)`);
  lines.push(`- [Mesafeli Satış Sözleşmesi](${BASE_URL}/mesafeli-satis)`);
  lines.push("");

  lines.push("## Makine Okunabilir İçerik");
  lines.push(`- Ürün detayları: ${BASE_URL}/llm-content/product/[id]`);
  lines.push(`- Kategori bilgileri: ${BASE_URL}/llm-content/category/[id]`);
  lines.push("");

  lines.push(`> Son güncelleme: ${new Date().toISOString().split("T")[0]}`);

  return lines.join("\n");
}

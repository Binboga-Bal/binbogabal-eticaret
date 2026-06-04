const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";

interface ProductVariantForSchema {
  price: string | number | { toString(): string };
  discountedPrice?: string | number | { toString(): string } | null;
  stock: number;
  size: number;
  sku?: string | null;
}

interface ReviewForSchema {
  rating: number;
  title?: string | null;
  comment?: string | null;
  user: { name?: string | null };
  createdAt: Date;
}

interface ProductForSchema {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  images: string[];
  variants: ProductVariantForSchema[];
  reviews?: ReviewForSchema[];
  categories?: { name: string }[];
}

export function buildProductSchema(product: ProductForSchema) {
  const activeVariants = product.variants.filter((v) => v.stock > 0);
  const cheapest = activeVariants.sort(
    (a, b) => Number(a.discountedPrice ?? a.price) - Number(b.discountedPrice ?? b.price)
  )[0];

  const approvedReviews = product.reviews ?? [];
  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
      : null;

  const offers = cheapest
    ? {
        "@type": "Offer",
        priceCurrency: "TRY",
        price: Number(cheapest.discountedPrice ?? cheapest.price).toFixed(2),
        availability:
          cheapest.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `${BASE_URL}/urunlerimiz/${product.slug}`,
        seller: {
          "@type": "Organization",
          name: process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı",
        },
      }
    : undefined;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images,
    url: `${BASE_URL}/urunlerimiz/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı",
    },
    category: product.categories?.[0]?.name,
  };

  if (offers) schema.offers = offers;

  if (avgRating && approvedReviews.length > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: approvedReviews.length,
      bestRating: 5,
      worstRating: 1,
    };
    schema.review = approvedReviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      name: r.title ?? undefined,
      reviewBody: r.comment ?? undefined,
      author: {
        "@type": "Person",
        name: r.user.name ?? "Müşteri",
      },
      datePublished: r.createdAt.toISOString().split("T")[0],
    }));
  }

  return schema;
}

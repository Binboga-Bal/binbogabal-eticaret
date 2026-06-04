const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";

interface CategoryForSchema {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export function buildCategorySchema(category: CategoryForSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description ?? undefined,
    url: `${BASE_URL}/urunlerimiz?kategori=${category.slug}`,
    image: category.image ?? undefined,
  };
}

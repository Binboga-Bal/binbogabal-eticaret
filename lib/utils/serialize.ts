import type { Product, ProductVariant } from "@prisma/client";

export type SerializedVariant = Omit<
  ProductVariant,
  "price" | "discountedPrice" | "createdAt" | "updatedAt"
> & {
  price: number;
  discountedPrice: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedProduct = Omit<Product, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  images: string[];
  variants: SerializedVariant[];
  categories?: { id: string; name: string; slug: string }[];
  honeyTypes?: { id: string; slug: string; label: string }[];
  tasteNotes?: string[] | null;
  usageSuggestions?: string[] | null;
};

export function serializeVariant(v: ProductVariant): SerializedVariant {
  return {
    ...v,
    price: parseFloat(v.price.toString()),
    discountedPrice: v.discountedPrice
      ? parseFloat(v.discountedPrice.toString())
      : null,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

export function serializeProduct(
  product: Product & {
    variants: ProductVariant[];
    categories?: { id: string; name: string; slug: string }[];
    honeyTypes?: { id: string; slug: string; label: string }[];
  }
): SerializedProduct {
  const rawImages = product.images;
  let images: string[] = [];
  if (Array.isArray(rawImages)) {
    images = rawImages as string[];
  } else if (typeof rawImages === "string") {
    try {
      images = JSON.parse(rawImages);
    } catch {
      images = [];
    }
  }

  return {
    ...product,
    images,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    tasteNotes: Array.isArray(product.tasteNotes) ? product.tasteNotes as string[] : null,
    usageSuggestions: Array.isArray(product.usageSuggestions) ? product.usageSuggestions as string[] : null,
    variants: product.variants.map(serializeVariant),
    categories: product.categories?.map(({ id, name, slug }) => ({ id, name, slug })),
    honeyTypes: product.honeyTypes?.map(({ id, slug, label }) => ({ id, slug, label })),
  };
}

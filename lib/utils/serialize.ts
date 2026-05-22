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
  category?: { id: string; name: string; slug: string } | null;
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
    category?: { id: string; name: string; slug: string } | null;
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
    variants: product.variants.map(serializeVariant),
  };
}

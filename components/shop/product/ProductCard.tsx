import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatWeight, calculateDiscount } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";
import type { SerializedProduct } from "@/lib/utils/serialize";

interface ProductCardProps {
  product: SerializedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0] ?? null;

  const defaultVariant = product.variants.find((v) => v.isActive) ?? product.variants[0];
  if (!defaultVariant) return null;

  const discount = defaultVariant.discountedPrice
    ? calculateDiscount(defaultVariant.price, defaultVariant.discountedPrice)
    : 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover">
      <Link
        href={`/urunlerimiz/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-gray-50"
      >
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">🍯</div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3">
            <Badge variant="discount">%{discount} İNDİRİM</Badge>
          </div>
        )}
        {product.isNew && !discount && (
          <div className="absolute top-3 left-3">
            <Badge variant="new">YENİ</Badge>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/urunlerimiz/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 hover:text-honey-dark transition-colors line-clamp-2">
            {product.name} {formatWeight(defaultVariant.size)}
          </h3>
        </Link>

        <div className="flex items-end gap-2 mt-2">
          {defaultVariant.discountedPrice ? (
            <>
              <span className="text-lg font-black text-honey-dark">
                {formatPrice(defaultVariant.discountedPrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(defaultVariant.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-black text-honey-dark">
              {formatPrice(defaultVariant.price)}
            </span>
          )}
        </div>

        <AddToCartButton product={product} variant={defaultVariant} />
      </div>
    </div>
  );
}

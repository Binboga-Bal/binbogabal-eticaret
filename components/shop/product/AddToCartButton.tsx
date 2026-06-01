"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import type { SerializedProduct, SerializedVariant } from "@/lib/utils/serialize";

interface AddToCartButtonProps {
  product: SerializedProduct;
  variant: SerializedVariant;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0] ?? "",
      size: variant.size,
      packagingType: variant.packagingType,
      price: variant.price,
      discountedPrice: variant.discountedPrice,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (variant.stock === 0) {
    return (
      <Button disabled className={className ?? "w-full mt-3"} size="sm">
        Stokta Yok
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAdd}
      variant={added ? "secondary" : "outline"}
      className={className ?? "w-full mt-3"}
      size="sm"
    >
      {added ? (
        <>
          <Check size={16} />
          Sepete Eklendi
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          Sepete Ekle
        </>
      )}
    </Button>
  );
}

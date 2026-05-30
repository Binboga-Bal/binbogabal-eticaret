import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/format";
import Link from "next/link";
import { Heart } from "lucide-react";
import { RemoveFavoriteButton } from "./RemoveFavoriteButton";

export const metadata = { title: "Favorilerim" };

export default async function FavorilerimPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: { variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Favorilerim</h1>
      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <Heart size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Favori ürününüz yok</p>
          <Link href="/urunlerimiz" className="btn-primary inline-flex mt-4 text-sm">Ürünleri Keşfet</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const product = fav.product;
            const variant = product.variants[0];
            const images = product.images as string[];
            const price = variant ? Number(variant.discountedPrice ?? variant.price) : null;

            return (
              <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {images[0] && (
                  <Link href={`/urunlerimiz/${product.slug}`}>
                    <img src={images[0]} alt={product.name} className="w-full h-56 object-contain p-3" />
                  </Link>
                )}
                <div className="p-4">
                  <Link href={`/urunlerimiz/${product.slug}`} className="font-semibold text-gray-800 hover:text-honey-dark text-sm line-clamp-2">
                    {product.name}
                  </Link>
                  {price && <p className="text-honey-dark font-black mt-1">{formatPrice(price)}</p>}
                  <RemoveFavoriteButton productId={product.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

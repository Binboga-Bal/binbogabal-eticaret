import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";
import { PendingReviewForm } from "./PendingReviewForm";

export const metadata = { title: "Bekleyen Yorumlar" };

export default async function BekleyenYorumlarPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const pendingItems = await prisma.orderItem.findMany({
    where: {
      reviewed: false,
      order: { userId: session.user.id, status: "DELIVERED" },
    },
    include: {
      order: { select: { id: true, orderNumber: true } },
      variant: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Bekleyen Yorumlar</h1>
      {pendingItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <Star size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Yorum bekleyen ürününüz yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => {
            const product = item.variant.product;
            const images = product.images as string[];
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-4 mb-4">
                  {images[0] && <img src={images[0]} alt={product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                  <div>
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-400">{item.variantInfo}</p>
                    <p className="text-xs text-gray-400">Sipariş: {item.order.orderNumber}</p>
                  </div>
                </div>
                <PendingReviewForm
                  productId={product.id}
                  orderId={item.order.id}
                  orderItemId={item.id}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

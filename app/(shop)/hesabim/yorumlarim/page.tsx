export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Yorumlarım" };

export default async function YorumlarimPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: { product: { select: { name: true, slug: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Yorumlarım</h1>
        <Link href="/hesabim/yorumlarim/bekleyenler" className="text-sm text-honey-dark font-semibold hover:underline">
          Bekleyen Yorumlar
        </Link>
      </div>
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <Star size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Henüz yorum yapmadınız</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const images = review.product.images as string[];
            return (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  {images[0] && <img src={images[0]} alt={review.product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <Link href={`/urunlerimiz/${review.product.slug}`} className="font-semibold text-gray-800 hover:text-honey-dark text-sm">
                      {review.product.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "text-honey fill-honey" : "text-gray-200 fill-gray-200"} />
                      ))}
                    </div>
                    {review.title && <p className="text-sm font-semibold text-gray-800 mt-2">{review.title}</p>}
                    {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${review.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {review.isApproved ? "Yayında" : "Onay Bekliyor"}
                      </span>
                      <span className="text-xs text-gray-400">{review.createdAt.toLocaleDateString("tr-TR")}</span>
                    </div>
                    {review.adminReply && (
                      <div className="mt-3 bg-honey-light rounded-xl p-3">
                        <p className="text-xs font-semibold text-honey-dark mb-1">Satıcı Yanıtı</p>
                        <p className="text-sm text-gray-700">{review.adminReply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

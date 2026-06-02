import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";
import { ReviewActions } from "./ReviewActions";
import { Star } from "lucide-react";

export const metadata = { title: "Yorumlar — Admin" };
export const dynamic = "force-dynamic";

const TABS = [
  { key: "pending", label: "Bekleyenler" },
  { key: "approved", label: "Onaylananlar" },
  { key: "all", label: "Tümü" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

export default async function YorumlarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requirePermission("content", "view");
  const { status = "pending", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr));
  const limit = 20;

  const where =
    status === "pending"
      ? { isApproved: false }
      : status === "approved"
      ? { isApproved: true }
      : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yorumlar</h1>

      {/* Sekmeler */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <a
            key={tab.key}
            href={`/admin/yorumlar?status=${tab.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === tab.key
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          Bu kategoride yorum yok.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-gray-100 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarRow rating={review.rating} />
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    {review.isApproved ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Onaylı
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                        Bekliyor
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{review.user.name}</p>
                  <p className="text-xs text-gray-400">{review.user.email}</p>
                  <a
                    href={`/urunlerimiz/${review.product.slug}`}
                    target="_blank"
                    className="text-xs text-amber-600 hover:underline"
                  >
                    {review.product.name}
                  </a>
                </div>
                <ReviewActions review={{ id: review.id, isApproved: review.isApproved, adminReply: review.adminReply ?? "" }} />
              </div>

              {review.title && (
                <p className="text-sm font-semibold text-gray-700">{review.title}</p>
              )}
              {review.comment && (
                <p className="text-sm text-gray-600 whitespace-pre-line">{review.comment}</p>
              )}

              {review.adminReply && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
                  <span className="font-semibold">Admin yanıtı: </span>
                  {review.adminReply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <a
              key={i}
              href={`/admin/yorumlar?status=${status}&page=${i + 1}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                page === i + 1
                  ? "bg-amber-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

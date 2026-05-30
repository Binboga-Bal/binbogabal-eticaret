"use client";

import { useState, useMemo } from "react";
import { FileText, FlaskConical, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PdfViewerOverlay } from "./PdfViewerOverlay";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

interface ProductTabsProps {
  description: string;
  shortDescription: string;
  analysisReportUrl?: string | null;
  reviews?: Review[];
}

const DEFAULT_REPORT = "/documents/ornek-analiz-raporu.pdf";

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-honey text-honey" : "fill-gray-200 text-gray-200"}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-12 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-honey rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400">{count}</span>
    </div>
  );
}

export function ProductTabs({ description, shortDescription, analysisReportUrl, reviews = [] }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");
  const [pdfOpen, setPdfOpen] = useState(false);

  const reportUrl = analysisReportUrl || DEFAULT_REPORT;

  const PAGE_SIZE = 4;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
  const pagedReviews = useMemo(
    () => reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [reviews, page]
  );

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const tabs = [
    { id: "description", label: "Ürün Açıklaması" },
    { id: "reviews",     label: `Müşteri Yorumları${reviews.length > 0 ? ` (${reviews.length})` : ""}` },
    { id: "analysis",    label: "Analiz Raporu" },
  ];

  return (
    <>
      <div>
        {/* Tab başlıkları */}
        <div className="border-b border-gray-200">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "border-honey-dark text-honey-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {/* Ürün Açıklaması */}
          {activeTab === "description" && (
            <div
              className="prose prose-sm max-w-none text-gray-700 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: description || shortDescription }}
            />
          )}

          {/* Müşteri Yorumları */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                  <Star size={32} className="text-gray-200" />
                  <p className="text-sm">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                </div>
              ) : (
                <>
                  {/* Özet */}
                  <div className="flex flex-col sm:flex-row gap-6 p-5 bg-[#FFF8EE] rounded-2xl">
                    {/* Ortalama puan */}
                    <div className="flex flex-col items-center justify-center gap-1 min-w-[100px]">
                      <span className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
                      <StarRow rating={Math.round(avgRating)} />
                      <span className="text-xs text-gray-500 mt-1">{reviews.length} yorum</span>
                    </div>
                    {/* Bar chart */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                      {ratingCounts.map(({ star, count }) => (
                        <RatingBar
                          key={star}
                          label={`${star} yıldız`}
                          count={count}
                          total={reviews.length}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Yorum listesi */}
                  <div className="space-y-4">
                    {pagedReviews.map((r) => (
                      <div key={r.id} className="border border-gray-100 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-honey/20 flex items-center justify-center text-honey-dark font-bold text-sm flex-shrink-0">
                              {(r.user.name ?? "M")[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm text-gray-800">
                              {r.user.name ?? "Müşteri"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarRow rating={r.rating} />
                            <span className="text-xs text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString("tr-TR", {
                                day: "numeric", month: "long", year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-sm text-gray-600 leading-relaxed pl-10">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-400">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, reviews.length)} / {reviews.length} yorum
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-honey-dark hover:text-honey-dark disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          ← Önceki
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={cn(
                              "w-8 h-8 text-xs rounded-lg border transition-colors",
                              page === i + 1
                                ? "bg-honey-dark text-white border-honey-dark"
                                : "border-gray-200 text-gray-600 hover:border-honey-dark hover:text-honey-dark"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-honey-dark hover:text-honey-dark disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          Sonraki →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Analiz Raporu */}
          {activeTab === "analysis" && (
            <div className="flex flex-col items-start gap-5">
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#FFF8EE] p-5 w-full max-w-md">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-honey/20 flex items-center justify-center">
                  <FlaskConical size={22} className="text-honey-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">Bal Kalite Analiz Raporu</p>
                  <p className="text-xs text-gray-500 mt-0.5">Lot: BB-2025-0347 · TS 3036 / EU 2001/110/EC</p>
                  <p className="text-xs text-gray-400 mt-0.5">Analiz Tarihi: 12.06.2025</p>
                </div>
                <button
                  onClick={() => setPdfOpen(true)}
                  className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold text-white bg-honey-dark hover:bg-honey transition-colors px-4 py-2 rounded-lg"
                >
                  <FileText size={13} /> Görüntüle
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Raporlar bağımsız akredite laboratuvarlar tarafından hazırlanmaktadır.
              </p>
            </div>
          )}
        </div>
      </div>

      {pdfOpen && (
        <PdfViewerOverlay
          url={reportUrl}
          title="Bal Kalite Analiz Raporu — BB-2025-0347"
          onClose={() => setPdfOpen(false)}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

interface Props {
  productId: string;
  orderId: string;
  orderItemId: string;
}

export function PendingReviewForm({ productId, orderId, orderItemId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Lütfen puan verin"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/customer/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, orderId, orderItemId, rating, title, comment }),
    });
    setLoading(false);
    if (!res.ok) { setError("Yorum gönderilemedi"); return; }
    setDone(true);
    router.refresh();
  }

  if (done) return <p className="text-sm text-green-600 font-semibold">Yorumunuz alındı, onay bekliyor.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
            <Star size={24} className={(hover || rating) >= s ? "text-honey fill-honey" : "text-gray-200 fill-gray-200"} />
          </button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (opsiyonel)"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey" />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Yorumunuzu yazın..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey resize-none" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? "Gönderiliyor..." : "Yorum Gönder"}
      </button>
    </form>
  );
}

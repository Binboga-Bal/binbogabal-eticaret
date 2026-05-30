"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, MessageSquare } from "lucide-react";

interface Props {
  review: { id: string; isApproved: boolean; adminReply: string };
}

export function ReviewActions({ review }: Props) {
  const router = useRouter();
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState(review.adminReply);
  const [saving, setSaving] = useState(false);

  async function patch(data: object) {
    setSaving(true);
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function saveReply() {
    await patch({ adminReply: reply });
    setReplyOpen(false);
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {!review.isApproved ? (
        <button
          onClick={() => patch({ isApproved: true })}
          disabled={saving}
          title="Onayla"
          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          <Check size={16} />
        </button>
      ) : (
        <button
          onClick={() => patch({ isApproved: false })}
          disabled={saving}
          title="Onayı Kaldır"
          className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors disabled:opacity-50"
        >
          <X size={16} />
        </button>
      )}

      <button
        onClick={() => setReplyOpen((v) => !v)}
        title="Yanıt Yaz"
        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <MessageSquare size={16} />
      </button>

      <button
        onClick={remove}
        title="Sil"
        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
      >
        <Trash2 size={16} />
      </button>

      {replyOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10 space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Admin yanıtı..."
            className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setReplyOpen(false)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={saveReply}
              disabled={saving}
              className="px-3 py-1.5 text-xs rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

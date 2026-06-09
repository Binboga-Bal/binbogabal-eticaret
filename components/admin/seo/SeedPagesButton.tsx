"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  missingCount: number;
}

export function SeedPagesButton({ missingCount }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number } | null>(null);

  if (missingCount === 0) return null;

  async function handleSeed() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/seo/seed-pages", { method: "POST" });
      const data = await res.json();
      setResult(data);
      if (data.created > 0) {
        setTimeout(() => window.location.reload(), 800);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-sm text-green-600 font-medium">
          {result.created} kayıt oluşturuldu
        </span>
      )}
      <button
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {missingCount} Eksik Sayfa İçin Meta Oluştur
      </button>
    </div>
  );
}

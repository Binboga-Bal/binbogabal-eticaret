"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";

interface Props {
  appliedCode?: string;
  discount?: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  orderAmount: number;
}

export function CouponInput({ appliedCode, discount, onApply, onRemove, orderAmount }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/campaigns/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase(), orderAmount }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Geçersiz kupon");
      return;
    }

    onApply(data.coupon.code, data.discount);
    setCode("");
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-green-600" />
          <div>
            <span className="text-sm font-bold text-green-800 font-mono">{appliedCode}</span>
            {discount !== undefined && discount > 0 && (
              <span className="text-xs text-green-600 ml-2">-{discount.toFixed(2)} ₺ indirim</span>
            )}
          </div>
        </div>
        <button onClick={onRemove} className="text-green-500 hover:text-green-700">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Kupon kodu"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-honey"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-honey text-white rounded-xl text-sm font-bold hover:bg-honey-dark disabled:opacity-50"
        >
          {loading ? "..." : "Uygula"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 px-1">{error}</p>}
    </div>
  );
}

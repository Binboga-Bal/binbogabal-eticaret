"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handle() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handle} className="mt-3 flex items-center gap-1.5 text-xs text-honey-dark font-semibold hover:underline">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Kopyalandı!" : "Kopyala"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  text: string;
  className?: string;
}

export function CopyText({ text, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="select-all">{text}</span>
      <button
        onClick={handleCopy}
        title="Kopyala"
        className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
      >
        {copied
          ? <Check size={13} className="text-green-500" />
          : <Copy size={13} />
        }
      </button>
    </span>
  );
}

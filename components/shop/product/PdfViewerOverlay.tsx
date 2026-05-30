"use client";

import { X, Download, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface Props {
  url: string;
  title?: string;
  onClose: () => void;
}

export function PdfViewerOverlay({ url, title = "Analiz Raporu", onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Başlık çubuğu */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <span className="font-semibold text-gray-800 text-sm truncate pr-4">{title}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={url}
              download
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <Download size={13} /> İndir
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <ExternalLink size={13} /> Yeni Sekmede Aç
            </a>
            <button
              onClick={onClose}
              className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PDF alanı */}
        <div className="flex-1 bg-gray-50 overflow-hidden">
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

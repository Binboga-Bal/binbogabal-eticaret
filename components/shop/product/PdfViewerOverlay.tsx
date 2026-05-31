"use client";

import { X, Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  url: string;
  title?: string;
  onClose: () => void;
}

export function PdfViewerOverlay({ url, title = "Analiz Raporu", onClose }: Props) {
  const [iframeError, setIframeError] = useState(false);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6 lg:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex flex-col w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ height: "min(90vh, 900px)" }}
      >

        {/* Başlık çubuğu */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0 min-w-0">
          <span className="font-semibold text-gray-800 text-sm truncate min-w-0">{title}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={url}
              download
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              title="İndir"
            >
              <Download size={14} />
              <span className="hidden sm:inline">İndir</span>
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100 whitespace-nowrap"
              title="Yeni Sekmede Aç"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Yeni Sekmede Aç</span>
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
        <div className="flex-1 bg-gray-50 overflow-hidden min-h-0">
          {iframeError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
              <p className="text-sm text-gray-500">PDF önizlemesi bu tarayıcıda desteklenmiyor.</p>
              <div className="flex gap-3">
                <a
                  href={url}
                  download
                  className="flex items-center gap-2 bg-honeyDark text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-honey transition-colors"
                >
                  <Download size={15} /> İndir
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink size={15} /> Yeni Sekmede Aç
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full border-0"
              title={title}
              onError={() => setIframeError(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

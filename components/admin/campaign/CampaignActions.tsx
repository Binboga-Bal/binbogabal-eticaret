"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Copy, Pause, Play, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import type { CampaignStatus } from "@prisma/client";

export function CampaignActions({ campaignId, status }: { campaignId: string; status: CampaignStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  function openMenu() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right,
    });
    setOpen(true);
  }

  // Scroll veya resize'da kapat
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  async function action(endpoint: string) {
    setLoading(true);
    setOpen(false);
    await fetch(`/api/admin/campaigns/${campaignId}/${endpoint}`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Kampanya iptal edilecek. Emin misiniz?")) return;
    setOpen(false);
    await fetch(`/api/admin/campaigns/${campaignId}`, { method: "DELETE" });
    router.refresh();
  }

  const menu = open ? (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

      {/* Menü — fixed, overflow dışına taşmaz */}
      <div
        style={{ position: "absolute", top: menuPos.top, right: menuPos.right }}
        className="z-50 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-sm"
      >
        <Link
          href={`/admin/kampanyalar/${campaignId}`}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
          onClick={() => setOpen(false)}
        >
          <Eye size={14} /> Detay / Düzenle
        </Link>
        <button
          onClick={() => action("duplicate")}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full text-left"
        >
          <Copy size={14} /> Klonla
        </button>

        {status === "PENDING_APPROVAL" && (
          <button
            onClick={() => action("approve")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-green-700 w-full text-left"
          >
            <CheckCircle size={14} /> Onayla
          </button>
        )}
        {status === "ACTIVE" && (
          <button
            onClick={() => action("pause")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-orange-700 w-full text-left"
          >
            <Pause size={14} /> Duraklat
          </button>
        )}
        {(status === "PAUSED" || status === "DRAFT") && (
          <button
            onClick={() => action("resume")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-green-700 w-full text-left"
          >
            <Play size={14} /> Devam Ettir
          </button>
        )}

        <hr className="my-1 border-gray-100" />
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left"
        >
          <Trash2 size={14} /> İptal Et
        </button>
      </div>
    </>
  ) : null;

  return (
    <div className="inline-block">
      <button
        ref={btnRef}
        onClick={openMenu}
        disabled={loading}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40"
      >
        <MoreHorizontal size={16} />
      </button>

      {typeof window !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}

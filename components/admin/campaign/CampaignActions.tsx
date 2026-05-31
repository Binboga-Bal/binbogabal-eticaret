"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Copy, Pause, Play, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import type { CampaignStatus } from "@prisma/client";

export function CampaignActions({ campaignId, status }: { campaignId: string; status: CampaignStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(endpoint: string) {
    setLoading(true);
    setOpen(false);
    await fetch(`/api/admin/campaigns/${campaignId}/${endpoint}`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Kampanya iptal edilecek. Emin misiniz?")) return;
    await action(".."); // soft delete via DELETE
    await fetch(`/api/admin/campaigns/${campaignId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm">
            <Link
              href={`/admin/kampanyalar/${campaignId}`}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              onClick={() => setOpen(false)}
            >
              <Eye size={14} /> Detay / Düzenle
            </Link>
            <button
              onClick={() => action("duplicate")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full"
            >
              <Copy size={14} /> Klonla
            </button>
            {status === "PENDING_APPROVAL" && (
              <button
                onClick={() => action("approve")}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-green-700 w-full"
              >
                <CheckCircle size={14} /> Onayla
              </button>
            )}
            {status === "ACTIVE" && (
              <button
                onClick={() => action("pause")}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-orange-700 w-full"
              >
                <Pause size={14} /> Duraklat
              </button>
            )}
            {status === "PAUSED" && (
              <button
                onClick={() => action("resume")}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-green-700 w-full"
              >
                <Play size={14} /> Devam Ettir
              </button>
            )}
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full"
            >
              <Trash2 size={14} /> İptal Et
            </button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import type { CampaignStatus } from "@prisma/client";

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  DRAFT: { label: "Taslak", className: "bg-gray-100 text-gray-600" },
  PENDING_APPROVAL: { label: "Onay Bekliyor", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Onaylandı", className: "bg-blue-100 text-blue-700" },
  ACTIVE: { label: "Aktif", className: "bg-green-100 text-green-700" },
  PAUSED: { label: "Duraklatıldı", className: "bg-orange-100 text-orange-700" },
  ENDED: { label: "Sona Erdi", className: "bg-gray-100 text-gray-500" },
  CANCELLED: { label: "İptal", className: "bg-red-100 text-red-600" },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

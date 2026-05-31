import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CampaignBuilder } from "@/components/admin/campaign-builder/CampaignBuilder";
import { CampaignStatusBadge } from "@/components/admin/campaign/CampaignStatusBadge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { BarChart2, FlaskConical, Layers } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const c = await prisma.campaign.findUnique({ where: { id }, select: { name: true } });
  return { title: `${c?.name ?? "Kampanya"} | Admin` };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      conditions: { orderBy: { sortOrder: "asc" } },
      actions: { orderBy: { sortOrder: "asc" } },
      segments: true,
      _count: { select: { usages: true, coupons: true } },
    },
  });

  if (!campaign) notFound();

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">{campaign.name}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatDate(campaign.startsAt)}
            {campaign.endsAt && ` → ${formatDate(campaign.endsAt)}`}
            {" · "}{campaign._count.usages} kullanım · {campaign._count.coupons} kupon
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/kampanyalar/${id}/stats`}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <BarChart2 size={14} />
            İstatistikler
          </Link>
          <Link
            href={`/admin/kampanyalar/${id}/ab-test`}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <FlaskConical size={14} />
            A/B Test
          </Link>
          <Link
            href={`/admin/kampanyalar/${id}/displays`}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <Layers size={14} />
            Gösterimler
          </Link>
        </div>
      </div>

      {/* Builder */}
      <CampaignBuilder
        initialData={{
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          description: campaign.description ?? "",
          type: campaign.type,
          priority: campaign.priority,
          stackable: campaign.stackable,
          requiresApproval: campaign.requiresApproval,
          maxDiscountAmount: campaign.maxDiscountAmount ? String(campaign.maxDiscountAmount) : "",
          budgetLimit: campaign.budgetLimit ? String(campaign.budgetLimit) : "",
          startsAt: campaign.startsAt.toISOString().slice(0, 16),
          endsAt: campaign.endsAt ? campaign.endsAt.toISOString().slice(0, 16) : "",
          conditions: campaign.conditions.map((c) => ({
            id: c.id,
            type: c.type,
            operator: c.operator,
            value: c.value as Record<string, unknown>,
            logicGroup: c.logicGroup,
            sortOrder: c.sortOrder,
          })),
          actions: campaign.actions.map((a) => ({
            id: a.id,
            type: a.type,
            value: a.value as Record<string, unknown>,
            sortOrder: a.sortOrder,
          })),
        }}
      />
    </div>
  );
}

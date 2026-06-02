export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { CampaignCalendar } from "@/components/admin/campaign/CampaignCalendar";

export const metadata = { title: "Kampanya Takvimi | Admin" };

export default async function CampaignCalendarPage() {
  await requirePermission("campaigns", "view");
  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: ["ACTIVE", "APPROVED", "PAUSED", "DRAFT"] } },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      startsAt: true,
      endsAt: true,
      priority: true,
    },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Kampanya Takvimi</h1>
      <CampaignCalendar campaigns={campaigns} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CampaignBanner } from "@/components/campaign-display/CampaignBanner";

export const metadata = { title: "Kampanyalar | Binboğa Kooperatif Balı" };

export default async function KampanyalarPage() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      startsAt: { lte: new Date() },
      OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
    },
    include: {
      displays: { where: { isActive: true, type: "BANNER" }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { priority: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Kampanyalar</h1>
        <p className="text-gray-500 mt-1">{campaigns.length} aktif kampanya</p>
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Şu anda aktif kampanya bulunmuyor.</p>
          <p className="text-sm mt-2">Yakında yeni kampanyalar gelecek!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => {
          const display = campaign.displays[0];
          return (
            <div key={campaign.id}>
              {display ? (
                <Link href={`/kampanya/${campaign.slug}`}>
                  <CampaignBanner display={display} endsAt={campaign.endsAt} />
                </Link>
              ) : (
                <Link
                  href={`/kampanya/${campaign.slug}`}
                  className="block bg-honey-cream border border-honey/20 rounded-2xl p-6 hover:border-honey/40 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                  {campaign.description && (
                    <p className="text-sm text-gray-600 mt-2">{campaign.description}</p>
                  )}
                  {campaign.endsAt && (
                    <p className="text-xs text-gray-400 mt-3">
                      Son: {new Date(campaign.endsAt).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

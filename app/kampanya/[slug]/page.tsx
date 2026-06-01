export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CampaignBanner } from "@/components/campaign-display/CampaignBanner";
import { CountdownTimer } from "@/components/campaign-display/CountdownTimer";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const c = await prisma.campaign.findUnique({ where: { slug }, select: { name: true, description: true } });
  return {
    title: c ? `${c.name} | Binboğa Kooperatif Balı` : "Kampanya",
    description: c?.description,
  };
}

export default async function CampaignLandingPage({ params }: Props) {
  const { slug } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      displays: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!campaign) notFound();

  const bannerDisplay = campaign.displays.find((d) => d.type === "BANNER");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Banner */}
      {bannerDisplay && (
        <CampaignBanner display={bannerDisplay} endsAt={campaign.endsAt} />
      )}

      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-gray-600 mt-3 leading-relaxed">{campaign.description}</p>
        )}

        {campaign.endsAt && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-500">Kampanya bitiyor:</span>
            <CountdownTimer endsAt={campaign.endsAt} />
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/urunlerimiz"
        className="inline-block bg-honey text-white px-8 py-3 rounded-2xl font-bold text-base hover:bg-honey-dark transition-colors"
      >
        Alışverişe Başla
      </Link>
    </div>
  );
}

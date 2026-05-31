import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, MAIL_FROM } from "@/lib/mail/resend";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  // Bitimine 3 saat kalan aktif kampanyalar
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      endsAt: { gte: now, lte: in3Hours },
    },
    include: {
      notifications: {
        where: { type: "CAMPAIGN_REMINDER", status: "SENT" },
      },
    },
  });

  let sent = 0;
  for (const campaign of campaigns) {
    // Zaten gönderilmişse atla
    if (campaign.notifications.length > 0) continue;

    // Newsletter abonelerine hatırlatma gönder
    const subscribers = await prisma.notificationPreference.findMany({
      where: { newsletter: true },
      include: { user: { select: { email: true, name: true } } },
      take: 500,
    });

    if (subscribers.length > 0) {
      const batch = subscribers.map((s) => ({
        from: MAIL_FROM,
        to: s.user.email,
        subject: `${APP_NAME} — Kampanya Bitiyor: ${campaign.name}`,
        html: `<p>Merhaba ${s.user.name ?? "Müşterimiz"},</p>
<p><strong>${campaign.name}</strong> kampanyası 3 saat içinde sona eriyor!</p>
<p><a href="${APP_URL}/kampanya/${campaign.slug}">Hemen incele</a></p>`,
      }));

      await resend.batch.send(batch as Parameters<typeof resend.batch.send>[0]);
      sent += subscribers.length;
    }

    await prisma.campaignNotification.create({
      data: {
        campaignId: campaign.id,
        type: "CAMPAIGN_REMINDER",
        channel: "email",
        subject: `Kampanya bitiyor: ${campaign.name}`,
        sentAt: now,
        status: "SENT",
      },
    });
  }

  return NextResponse.json({ sent, campaigns: campaigns.length });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/customer-auth";
import { z } from "zod";

const schema = z.object({
  orderUpdates: z.boolean().optional(),
  favoriteDiscounts: z.boolean().optional(),
  couponReminders: z.boolean().optional(),
  reviewRequests: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const pref = await prisma.notificationPreference.findUnique({ where: { userId: user.id } });
  if (!pref) {
    // İlk erişimde varsayılan tercihler oluştur
    const created = await prisma.notificationPreference.create({ data: { userId: user.id } });
    return NextResponse.json(created);
  }

  return NextResponse.json(pref);
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  const pref = await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(pref);
}

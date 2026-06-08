import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "settings", "update")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const settings: Record<string, string> = await req.json();

  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );

  // Sayfa içerik ayarları değiştiğinde ISR cache'i anında temizle
  revalidatePath("/");
  revalidatePath("/urunlerimiz");
  revalidatePath("/hakkimizda");
  revalidatePath("/kooperatif-hikayemiz");
  revalidatePath("/bal-rehberi");
  revalidatePath("/iletisim");

  return NextResponse.json({ success: true });
}

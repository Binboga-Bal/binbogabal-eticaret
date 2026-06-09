import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit/logger";

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

  await logAction({ adminId: session.adminId, action: "update", module: "settings", targetLabel: Object.keys(settings).join(", "), req });

  // Sayfa içerik ayarları değiştiğinde ISR cache'i anında temizle
  revalidatePath("/");
  revalidatePath("/urunlerimiz");
  revalidatePath("/hakkimizda");
  revalidatePath("/kooperatif-hikayemiz");
  revalidatePath("/bal-rehberi");
  revalidatePath("/iletisim");
  revalidatePath("/kvkk");
  revalidatePath("/gizlilik");
  revalidatePath("/iade-degisim");
  revalidatePath("/mesafeli-satis");
  revalidatePath("/cerez-politikasi");

  return NextResponse.json({ success: true });
}

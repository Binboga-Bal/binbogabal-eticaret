import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { syncProductsFromErp, syncStockFromErp } from "@/lib/dia-erp/sync";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "erp", "sync")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  try {
    if (type === "products") {
      const result = await syncProductsFromErp();
      revalidatePath("/");
      revalidatePath("/urunlerimiz");
      revalidatePath("/urunlerimiz/[slug]", "page");
      return NextResponse.json({
        message: `${result.synced} ürün senkronize edildi${result.errors.length > 0 ? `, ${result.errors.length} hata` : ""}`,
      });
    }

    if (type === "stock") {
      const result = await syncStockFromErp();
      revalidatePath("/");
      revalidatePath("/urunlerimiz");
      revalidatePath("/urunlerimiz/[slug]", "page");
      return NextResponse.json({ message: `${result.updated} varyant stoku güncellendi` });
    }

    return NextResponse.json({ error: "Bilinmeyen senkronizasyon türü" }, { status: 400 });
  } catch (err) {
    console.error("ERP sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}

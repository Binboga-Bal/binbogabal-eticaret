import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncProductsFromErp, syncStockFromErp } from "@/lib/dia-erp/sync";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  try {
    if (type === "products") {
      const result = await syncProductsFromErp();
      return NextResponse.json({
        message: `${result.synced} ürün senkronize edildi${result.errors.length > 0 ? `, ${result.errors.length} hata` : ""}`,
      });
    }

    if (type === "stock") {
      const result = await syncStockFromErp();
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

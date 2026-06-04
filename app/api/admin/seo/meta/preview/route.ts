import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { title, description, url } = await req.json();

  // SERP önizleme — hesaplanan meta verilerini döndür
  const truncatedTitle = title ? title.slice(0, 60) : "";
  const truncatedDesc = description ? description.slice(0, 160) : "";
  const displayUrl = url ?? "";

  return NextResponse.json({
    title: truncatedTitle,
    description: truncatedDesc,
    url: displayUrl,
    titleLength: title?.length ?? 0,
    descLength: description?.length ?? 0,
    titleStatus:
      !title ? "missing"
      : title.length < 30 ? "too_short"
      : title.length > 60 ? "too_long"
      : "ok",
    descStatus:
      !description ? "missing"
      : description.length < 120 ? "too_short"
      : description.length > 160 ? "too_long"
      : "ok",
  });
}

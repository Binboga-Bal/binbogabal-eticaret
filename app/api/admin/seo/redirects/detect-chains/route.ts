import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can } from "@/lib/rbac/permission-checker";
import { prisma } from "@/lib/prisma";

// Redirect zincirlerini tespit eder: A→B→C gibi durumlar
export async function POST(_req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  if (!await can(session.adminId, "seo", "view")) return NextResponse.json({ error: "Yetersiz yetki" }, { status: 403 });

  const allRedirects = await prisma.redirect.findMany({
    where: { isActive: true },
    select: { id: true, fromPath: true, toPath: true },
  });

  const redirectMap = new Map(allRedirects.map((r) => [r.fromPath, r.toPath]));
  const chains: { from: string; chain: string[]; length: number }[] = [];

  for (const redirect of allRedirects) {
    const chain = [redirect.fromPath];
    let current = redirect.toPath;
    const visited = new Set([redirect.fromPath]);

    while (redirectMap.has(current) && !visited.has(current)) {
      visited.add(current);
      chain.push(current);
      current = redirectMap.get(current)!;
    }
    chain.push(current);

    if (chain.length > 2) {
      chains.push({ from: redirect.fromPath, chain, length: chain.length - 1 });
    }
  }

  return NextResponse.json({ chains, count: chains.length });
}

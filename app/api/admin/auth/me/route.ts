import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth/session";
import { resolvePermissions } from "@/lib/rbac/role-resolver";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const resolved = await resolvePermissions(session.adminId);

  return NextResponse.json({
    adminId: session.adminId,
    email: session.email,
    isSuperAdmin: session.isSuperAdmin,
    roles: session.roles,
    grants: resolved.isSuperAdmin ? ["*"] : [...resolved.grants],
    denies: [...resolved.denies],
  });
}

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth/session";
import { can, canAny } from "./permission-checker";
import type { PermissionCheck } from "./types";

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/auth/login");
  return session;
}

export async function requirePermission(module: string, action: string, scope?: string) {
  const session = await requireAdminSession();
  const allowed = await can(session.adminId, module, action, scope);
  if (!allowed) redirect("/admin/forbidden");
  return session;
}

export async function requireAnyPermission(checks: PermissionCheck[]) {
  const session = await requireAdminSession();
  const allowed = await canAny(session.adminId, checks);
  if (!allowed) redirect("/admin/forbidden");
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdminSession();
  if (!session.isSuperAdmin) redirect("/admin/forbidden");
  return session;
}

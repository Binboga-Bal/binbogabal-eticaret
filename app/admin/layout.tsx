import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/admin-auth/session";
import { prisma } from "@/lib/prisma";
import { resolvePermissions } from "@/lib/rbac/role-resolver";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

const AUTH_PATHS = [
  "/admin/auth/login",
  "/admin/auth/forgot-password",
  "/admin/auth/reset-password",
  "/admin/auth/accept-invite",
  "/admin/auth/change-password",
  "/admin/auth/2fa",
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-admin-pathname") ?? "";

  // Auth sub-pages render without sidebar (middleware already handles redirects)
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p)) || pathname.includes("/admin/auth/");

  if (isAuthPath) {
    return <>{children}</>;
  }

  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/auth/login");
  }

  const [admin, logoSetting, resolved] = await Promise.all([
    prisma.adminUser.findUnique({
      where: { id: session.adminId },
      select: { id: true, name: true, email: true, avatarUrl: true, mustChangePassword: true, status: true },
    }),
    prisma.siteSetting.findUnique({ where: { key: "img_logo" } }),
    resolvePermissions(session.adminId),
  ]);

  if (!admin || admin.status !== "ACTIVE") {
    redirect("/admin/auth/login");
  }

  if (admin.mustChangePassword) {
    redirect("/admin/auth/change-password");
  }

  const logoUrl = logoSetting?.value ?? null;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isSuperAdmin={resolved.isSuperAdmin}
        grants={resolved.grants}
        logoUrl={logoUrl}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          user={{
            id: admin.id,
            name: admin.name ?? "Admin",
            email: admin.email,
            image: admin.avatarUrl ?? null,
            role: session.isSuperAdmin ? "SUPERADMIN" : session.roles[0] ?? "EDITOR",
          }}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

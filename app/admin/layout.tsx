import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role ?? "")) {
    redirect("/hesabim/giris?from=admin");
  }

  const logoSetting = await prisma.siteSetting.findUnique({ where: { key: "img_logo" } });
  const logoUrl = logoSetting?.value ?? null;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar role={session.user.role ?? "EDITOR"} logoUrl={logoUrl} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

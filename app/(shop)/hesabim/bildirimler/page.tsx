export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsForm } from "./NotificationsForm";

export const metadata = { title: "Bildirim Tercihleri" };

export default async function BildirimlerPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const pref = await prisma.notificationPreference.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Bildirim Tercihleri</h1>
      <NotificationsForm defaultValues={pref ?? undefined} />
    </div>
  );
}

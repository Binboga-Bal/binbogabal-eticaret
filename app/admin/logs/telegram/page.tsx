import { getAdminSession } from "@/lib/admin-auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TelegramPageClient } from "./TelegramPageClient";

export default async function TelegramConfigPage() {
  const session = await getAdminSession();
  if (!session?.isSuperAdmin) redirect("/admin");

  const configs = await prisma.telegramAlertConfig.findMany({ orderBy: { createdAt: "desc" } });
  const botTokenSet = !!process.env.TELEGRAM_BOT_TOKEN;

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Telegram Alert Konfigürasyonu</h1>
        <Link href="/admin/logs" className="text-sm text-blue-600 hover:underline">
          ← Loglara Dön
        </Link>
      </div>

      {!botTokenSet && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          <strong>Uyarı:</strong> <code>TELEGRAM_BOT_TOKEN</code> environment variable tanımlanmamış. Telegram alertleri çalışmayacak.
        </div>
      )}

      <TelegramPageClient initialConfigs={configs} />
    </div>
  );
}

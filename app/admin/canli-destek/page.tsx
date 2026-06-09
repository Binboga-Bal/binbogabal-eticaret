export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { ChatDashboard } from "@/components/admin/ChatDashboard";

export const metadata = { title: "Canlı Destek | Admin" };

export default async function AdminChatPage() {
  await requirePermission("content", "view");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C57930, #F9B10B)" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Canlı Destek</h1>
          <p className="text-xs text-gray-500">Müşteri sohbetleri ve hızlı yanıt yönetimi</p>
        </div>
      </div>
      <ChatDashboard />
    </div>
  );
}

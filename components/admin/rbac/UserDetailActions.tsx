"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  adminId: string;
  status: string;
  isSuperAdmin: boolean;
}

export function UserDetailActions({ adminId, status, isSuperAdmin }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function action(endpoint: string, label: string) {
    if (!confirm(`"${label}" işlemini onaylıyor musunuz?`)) return;
    setLoading(label);
    const res = await fetch(`/api/admin/users/${adminId}/${endpoint}`, { method: "POST" });
    if (res.ok) { router.refresh(); } else { alert("İşlem başarısız"); }
    setLoading(null);
  }

  async function deleteUser() {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
    setLoading("Sil");
    const res = await fetch(`/api/admin/users/${adminId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/users");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Silme işlemi başarısız");
    }
    setLoading(null);
  }

  const btn = "w-full text-left px-3 py-2 text-sm rounded-lg transition hover:bg-gray-50 border border-gray-200 disabled:opacity-50";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">İşlemler</p>

      {status === "LOCKED" && (
        <button onClick={() => action("unlock", "Kilidi Aç")} disabled={!!loading} className={btn}>
          {loading === "Kilidi Aç" ? "..." : "🔓 Kilidi Aç"}
        </button>
      )}
      {status === "SUSPENDED" && (
        <button onClick={() => action("activate", "Aktifleştir")} disabled={!!loading} className={btn}>
          {loading === "Aktifleştir" ? "..." : "✅ Aktifleştir"}
        </button>
      )}
      {status === "ACTIVE" && !isSuperAdmin && (
        <button onClick={() => action("suspend", "Askıya Al")} disabled={!!loading} className={`${btn} text-orange-600`}>
          {loading === "Askıya Al" ? "..." : "⏸ Askıya Al"}
        </button>
      )}
      {status !== "ACTIVE" && status !== "SUSPENDED" && status !== "LOCKED" && (
        <button onClick={() => action("activate", "Aktifleştir")} disabled={!!loading} className={btn}>
          {loading === "Aktifleştir" ? "..." : "✅ Aktifleştir"}
        </button>
      )}
      <button onClick={() => action("force-logout", "Oturumları Kapat")} disabled={!!loading} className={btn}>
        {loading === "Oturumları Kapat" ? "..." : "🚪 Tüm Oturumları Kapat"}
      </button>

      <a href={`/admin/users/${adminId}/roles`} className={`${btn} block text-center`}>
        🎭 Rolleri Düzenle
      </a>
      <a href={`/admin/users/${adminId}/audit`} className={`${btn} block text-center`}>
        📋 Aktivite Geçmişi
      </a>
      <a href={`/admin/users/${adminId}/security`} className={`${btn} block text-center`}>
        🔐 Güvenlik Ayarları
      </a>

      {!isSuperAdmin && (
        <button
          onClick={deleteUser}
          disabled={!!loading}
          className={`${btn} text-red-600 border-red-200 hover:bg-red-50 mt-2`}
        >
          {loading === "Sil" ? "..." : "🗑 Kullanıcıyı Sil"}
        </button>
      )}
    </div>
  );
}

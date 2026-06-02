"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Permission { id: string; module: string; action: string; scope: string | null; description: string | null; }
interface RolePerm { permissionId: string; granted: boolean; }

interface Props {
  roleId: string;
  roleName: string;
  permissions: Permission[];
  rolePerms: RolePerm[];
}

export function RolePermissionsEditor({ roleId, roleName, permissions, rolePerms }: Props) {
  const router = useRouter();
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const rp of rolePerms) m[rp.permissionId] = rp.granted;
    return m;
  });
  const [pending, setPending] = useState<{ permissionId: string; granted: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  const modules = useMemo(() => {
    const g: Record<string, Permission[]> = {};
    for (const p of permissions) {
      if (!g[p.module]) g[p.module] = [];
      g[p.module].push(p);
    }
    return g;
  }, [permissions]);

  function toggle(permId: string) {
    const next = !state[permId];
    setState((prev) => ({ ...prev, [permId]: next }));
    setPending((prev) => {
      const idx = prev.findIndex((c) => c.permissionId === permId);
      if (idx !== -1) { const u = [...prev]; u[idx] = { permissionId: permId, granted: next }; return u; }
      return [...prev, { permissionId: permId, granted: next }];
    });
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/roles/${roleId}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: pending }),
    });
    setPending([]);
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      {pending.length > 0 && (
        <div className="sticky top-0 z-10 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-amber-700">{pending.length} değişiklik kaydedilmemiş</span>
          <button onClick={save} disabled={saving}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {Object.entries(modules).map(([module, perms]) => (
          <div key={module} className="border-b border-gray-100 last:border-0">
            <div className="bg-gray-50 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {module}
            </div>
            {perms.map((p) => (
              <label key={p.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                <input type="checkbox" checked={state[p.id] ?? false} onChange={() => toggle(p.id)} className="rounded" />
                <span className="flex-1">
                  <span className="font-mono text-sm">{p.action}{p.scope ? `:${p.scope}` : ""}</span>
                  {p.description && <span className="text-xs text-gray-400 ml-2">{p.description}</span>}
                </span>
                {pending.some((c) => c.permissionId === p.id) && (
                  <span className="text-xs text-amber-600 font-medium">değişti</span>
                )}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

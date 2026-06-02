"use client";

import { useState, useMemo } from "react";

interface Role { id: string; name: string; color: string | null; isSystem: boolean; }
interface Permission { id: string; module: string; action: string; scope: string | null; description: string | null; isSystem: boolean; }
interface RolePerm { roleId: string; permissionId: string; granted: boolean; }

interface Props {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePerm[];
}

export function PermissionMatrix({ roles, permissions, rolePermissions }: Props) {
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    for (const rp of rolePermissions) {
      if (!m[rp.roleId]) m[rp.roleId] = {};
      m[rp.roleId][rp.permissionId] = rp.granted;
    }
    return m;
  });
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ roleId: string; permissionId: string; granted: boolean }[]>([]);

  const modules = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    for (const p of permissions) {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    }
    return grouped;
  }, [permissions]);

  function toggle(roleId: string, permId: string) {
    const current = matrix[roleId]?.[permId] ?? false;
    const next = !current;
    setMatrix((prev) => ({ ...prev, [roleId]: { ...prev[roleId], [permId]: next } }));
    setPendingChanges((prev) => {
      const existing = prev.findIndex((c) => c.roleId === roleId && c.permissionId === permId);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { roleId, permissionId: permId, granted: next };
        return updated;
      }
      return [...prev, { roleId, permissionId: permId, granted: next }];
    });
  }

  function toggleColumn(roleId: string, granted: boolean) {
    const updates: { roleId: string; permissionId: string; granted: boolean }[] = [];
    const newMatrix = { ...matrix, [roleId]: { ...matrix[roleId] } };
    for (const p of permissions) {
      newMatrix[roleId][p.id] = granted;
      updates.push({ roleId, permissionId: p.id, granted });
    }
    setMatrix(newMatrix);
    setPendingChanges((prev) => {
      const filtered = prev.filter((c) => c.roleId !== roleId);
      return [...filtered, ...updates];
    });
  }

  function toggleRow(permId: string, granted: boolean) {
    const updates: { roleId: string; permissionId: string; granted: boolean }[] = [];
    const newMatrix = { ...matrix };
    for (const role of roles) {
      newMatrix[role.id] = { ...newMatrix[role.id], [permId]: granted };
      updates.push({ roleId: role.id, permissionId: permId, granted });
    }
    setMatrix(newMatrix);
    setPendingChanges((prev) => {
      const filtered = prev.filter((c) => c.permissionId !== permId);
      return [...filtered, ...updates];
    });
  }

  async function saveChanges() {
    if (pendingChanges.length === 0) return;
    setSaving(true);
    const res = await fetch("/api/admin/permissions/matrix", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: pendingChanges }),
    });
    if (res.ok) setPendingChanges([]);
    setSaving(false);
  }

  return (
    <div>
      {pendingChanges.length > 0 && (
        <div className="sticky top-0 z-10 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-amber-700">{pendingChanges.length} değişiklik kaydedilmemiş</span>
          <button onClick={saveChanges} disabled={saving}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
        <table className="text-xs min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 sticky left-0 bg-gray-50 w-48">İzin</th>
              {roles.map((role) => (
                <th key={role.id} className="px-3 py-3 text-center font-medium min-w-24">
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                      style={{ backgroundColor: role.color ?? "#6b7280" }}>{role.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => toggleColumn(role.id, true)}
                        className="text-green-600 hover:text-green-800 font-bold" title="Tümünü ver">+</button>
                      <button onClick={() => toggleColumn(role.id, false)}
                        className="text-red-500 hover:text-red-700 font-bold" title="Tümünü kaldır">−</button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(modules).map(([module, perms]) => (
              <>
                <tr key={`header-${module}`} className="bg-gray-50 border-t border-b border-gray-200">
                  <td colSpan={roles.length + 1}
                    className="px-4 py-2 font-semibold text-gray-700 uppercase tracking-wide text-xs sticky left-0 bg-gray-50">
                    {module}
                  </td>
                </tr>
                {perms.map((perm) => (
                  <tr key={perm.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 sticky left-0 bg-white hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleRow(perm.id, true)} className="text-green-500 hover:text-green-700 font-bold">+</button>
                        <button onClick={() => toggleRow(perm.id, false)} className="text-red-400 hover:text-red-600 font-bold">−</button>
                        <span className="font-mono text-gray-700">{perm.action}</span>
                        {perm.scope && <span className="text-gray-400">({perm.scope})</span>}
                      </div>
                      {perm.description && <div className="text-gray-400 mt-0.5 pl-10">{perm.description}</div>}
                    </td>
                    {roles.map((role) => {
                      const granted = matrix[role.id]?.[perm.id] ?? false;
                      const changed = pendingChanges.some((c) => c.roleId === role.id && c.permissionId === perm.id);
                      return (
                        <td key={role.id} className="px-3 py-2 text-center">
                          <button
                            onClick={() => toggle(role.id, perm.id)}
                            className={`w-6 h-6 rounded transition ${
                              granted
                                ? changed ? "bg-amber-400" : "bg-green-500"
                                : changed ? "bg-red-200" : "bg-gray-200"
                            }`}
                            title={granted ? "Verildi — kaldırmak için tıkla" : "Verilmemiş — vermek için tıkla"}
                          >
                            {granted ? (
                              <svg className="w-4 h-4 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

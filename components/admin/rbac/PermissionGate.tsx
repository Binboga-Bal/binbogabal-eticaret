"use client";

import { useEffect, useState } from "react";

interface Props {
  module: string;
  action: string;
  scope?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Client-side permission gate — calls /api/admin/auth/me for permissions
// For server components, use requirePermission() guard instead
export function PermissionGate({ module, action, scope, children, fallback = null }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.isSuperAdmin) { setAllowed(true); return; }
        const key = `${module}:${action}:${scope ?? ""}`;
        setAllowed(data.grants?.includes(key) ?? false);
      })
      .catch(() => setAllowed(false));
  }, [module, action, scope]);

  if (allowed === null) return null;
  return allowed ? <>{children}</> : <>{fallback}</>;
}

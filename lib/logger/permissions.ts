export function canViewLogs(isSuperAdmin: boolean): boolean {
  return isSuperAdmin;
}

export function canExportLogs(isSuperAdmin: boolean): boolean {
  return isSuperAdmin;
}

export function canManageTelegramAlerts(isSuperAdmin: boolean): boolean {
  return isSuperAdmin;
}

export function canCleanupLogs(isSuperAdmin: boolean): boolean {
  return isSuperAdmin;
}

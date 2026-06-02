export interface PermissionCheck {
  module: string;
  action: string;
  scope?: string;
}

export interface ResolvedPermissions {
  adminId: string;
  isSuperAdmin: boolean;
  grants: Set<string>; // "module:action:scope"
  denies: Set<string>;
  fieldGroups: Set<string>; // "module:fieldGroup"
}

export interface AdminJWTPayload {
  sub: string;       // adminId
  email: string;
  isSuperAdmin: boolean;
  roles: string[];   // slugs
  sessionId: string;
  iat?: number;
  exp?: number;
}

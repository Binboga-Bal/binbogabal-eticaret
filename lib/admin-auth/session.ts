import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export const ADMIN_ACCESS_COOKIE = "admin_access_token";
export const ADMIN_REFRESH_COOKIE = "admin_refresh_token";

export interface AdminSessionData {
  adminId: string;
  email: string;
  isSuperAdmin: boolean;
  roles: string[];
  sessionId: string;
}

export async function getAdminSession(): Promise<AdminSessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  return {
    adminId: payload.sub,
    email: payload.email,
    isSuperAdmin: payload.isSuperAdmin,
    roles: payload.roles,
    sessionId: payload.sessionId,
  };
}

export function setAdminCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_ACCESS_COOKIE}=${accessToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=900`
  );
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_REFRESH_COOKIE}=${refreshToken}; HttpOnly; Path=/api/admin/auth/refresh; SameSite=Lax; Max-Age=28800`
  );
}

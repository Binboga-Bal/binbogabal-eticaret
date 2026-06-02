import { SignJWT, jwtVerify } from "jose";
import type { AdminJWTPayload } from "@/lib/rbac/types";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "admin-fallback-secret-change-in-production"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_REFRESH_SECRET ?? "admin-refresh-fallback-change-in-production"
);

const ACCESS_TTL = "15m";
const REFRESH_TTL = "8h";

export async function signAccessToken(payload: Omit<AdminJWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: Omit<AdminJWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "cvv",
  "cardNumber",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "resetToken",
  "twoFactorSecret",
  "twoFactorBackupCodes",
  "inviteToken",
]);

export function sanitizeDetail(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeDetail);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = sanitizeDetail(value);
    }
  }
  return result;
}

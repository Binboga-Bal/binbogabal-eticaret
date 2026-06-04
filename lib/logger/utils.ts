import { type NextRequest } from "next/server";

export function extractRequestMeta(req: NextRequest | Request) {
  const headers = req.headers;
  return {
    actorIp:
      headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      headers.get("x-real-ip") ??
      "unknown",
    userAgent: headers.get("user-agent") ?? undefined,
    method: req.method,
    path: new URL(req.url).pathname,
  };
}

export function diffObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { changed: Record<string, { from: unknown; to: unknown }> } {
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of allKeys) {
    const bVal = JSON.stringify(before[key]);
    const aVal = JSON.stringify(after[key]);
    if (bVal !== aVal) {
      changed[key] = { from: before[key], to: after[key] };
    }
  }
  return { changed };
}

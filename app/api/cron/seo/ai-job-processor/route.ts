import { NextResponse } from "next/server";
import { processAiSeoQueue } from "@/lib/seo/ai/queue-processor";
import { isAiEnabled } from "@/lib/seo/ai/client";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  if (!isAiEnabled()) {
    return NextResponse.json({ ok: false, reason: "ANTHROPIC_API_KEY tanımlı değil" });
  }

  const start = Date.now();
  const result = await processAiSeoQueue(10);

  return NextResponse.json({ ok: true, ...result, ms: Date.now() - start });
}

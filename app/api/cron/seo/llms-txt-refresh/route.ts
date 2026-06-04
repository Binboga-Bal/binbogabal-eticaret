import { NextResponse } from "next/server";
import { generateLlmsTxt } from "@/lib/seo/generative/llms-txt-generator";
import { revalidatePath } from "next/cache";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const start = Date.now();
  const content = await generateLlmsTxt("tr");
  revalidatePath("/llms.txt");

  return NextResponse.json({
    ok: true,
    lines: content.split("\n").length,
    ms: Date.now() - start,
  });
}

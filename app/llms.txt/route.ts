import { NextResponse } from "next/server";
import { generateLlmsTxt } from "@/lib/seo/generative/llms-txt-generator";

// Günlük cache
export const revalidate = 86400;

export async function GET() {
  const content = await generateLlmsTxt("tr");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}

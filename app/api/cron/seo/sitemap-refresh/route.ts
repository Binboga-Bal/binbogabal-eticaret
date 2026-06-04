import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function authCheck(req: Request) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!authCheck(req)) return new Response("Unauthorized", { status: 401 });

  const [productCount, categoryCount, blogCount, campaignCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.blogPost.count({ where: { isPublished: true } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
  ]);

  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    ok: true,
    urls: { products: productCount, categories: categoryCount, blogs: blogCount, campaigns: campaignCount },
    total: productCount + categoryCount + blogCount + campaignCount + 10,
  });
}

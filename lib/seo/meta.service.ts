import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";

export type EntityType = "product" | "category" | "blog" | "campaign" | "page";

export async function getSeoMeta(entityType: EntityType, entityId: string, locale = "tr") {
  return prisma.seoMeta.findUnique({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
  }).catch(() => null);
}

export async function upsertSeoMeta(
  entityType: EntityType,
  entityId: string,
  locale: string,
  data: Parameters<typeof prisma.seoMeta.upsert>[0]["create"]
) {
  return prisma.seoMeta.upsert({
    where: { entityType_entityId_locale: { entityType, entityId, locale } },
    create: { ...data, entityType, entityId, locale },
    update: data,
  });
}

interface FallbackMeta {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  canonical?: string | null;
}

export async function buildMetadata(
  entityType: EntityType,
  entityId: string,
  fallback: FallbackMeta,
  locale = "tr"
): Promise<Metadata> {
  const seoMeta = await getSeoMeta(entityType, entityId, locale);

  const title = seoMeta?.title ?? fallback.title ?? undefined;
  const description = seoMeta?.description ?? fallback.description ?? undefined;
  const ogImage = seoMeta?.ogImage ?? fallback.image ?? undefined;
  const canonical = seoMeta?.canonicalUrl ?? fallback.canonical ?? undefined;

  const metadata: Metadata = {
    title,
    description,
    keywords: seoMeta?.keywords?.length ? seoMeta.keywords : undefined,
    robots: seoMeta?.noIndex
      ? { index: false, follow: !seoMeta.noFollow }
      : { index: true, follow: true },
  };

  if (canonical) {
    metadata.alternates = { canonical };
  }

  metadata.openGraph = {
    title: seoMeta?.ogTitle ?? title ?? undefined,
    description: seoMeta?.ogDescription ?? description ?? undefined,
    images: ogImage ? [ogImage] : undefined,
    type: (seoMeta?.ogType as "website" | "article") ?? "website",
    locale: "tr_TR",
    siteName: process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı",
  };

  metadata.twitter = {
    card: (seoMeta?.twitterCard as "summary_large_image" | "summary") ?? "summary_large_image",
    title: seoMeta?.twitterTitle ?? title ?? undefined,
    description: seoMeta?.twitterDescription ?? description ?? undefined,
    images: seoMeta?.twitterImage ?? ogImage ?? undefined,
  };

  return metadata;
}

export async function listSeoMeta(
  entityType?: EntityType,
  locale = "tr",
  page = 1,
  pageSize = 50
) {
  const where = {
    ...(entityType ? { entityType } : {}),
    locale,
  };
  const [items, total] = await Promise.all([
    prisma.seoMeta.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.seoMeta.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function applyTemplate(
  entityType: EntityType,
  locale: string,
  variables: Record<string, string>
) {
  const template = await prisma.seoTemplate.findFirst({
    where: { entityType, locale, isDefault: true },
  });
  if (!template) return null;

  const interpolate = (pattern: string) =>
    pattern.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? "");

  return {
    title: interpolate(template.titlePattern),
    description: interpolate(template.descPattern),
  };
}

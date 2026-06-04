export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SeoMetaEditor } from "@/components/admin/seo/SeoMetaEditor";

interface PageProps {
  params: Promise<{ entityType: string; entityId: string }>;
  searchParams: Promise<{ locale?: string }>;
}

async function getEntityInfo(entityType: string, entityId: string) {
  if (entityType === "product") {
    const p = await prisma.product.findUnique({ where: { id: entityId }, select: { name: true, slug: true, shortDescription: true, images: true, metaTitle: true, metaDescription: true } });
    return p ? { name: p.name, url: `/urunlerimiz/${p.slug}`, fallbackTitle: p.metaTitle ?? p.name, fallbackDesc: p.metaDescription ?? p.shortDescription } : null;
  }
  if (entityType === "blog") {
    const b = await prisma.blogPost.findUnique({ where: { id: entityId }, select: { title: true, slug: true, excerpt: true, metaTitle: true, metaDescription: true } });
    return b ? { name: b.title, url: `/bal-rehberi/${b.slug}`, fallbackTitle: b.metaTitle ?? b.title, fallbackDesc: b.metaDescription ?? b.excerpt } : null;
  }
  if (entityType === "campaign") {
    const c = await prisma.campaign.findUnique({ where: { id: entityId }, select: { name: true, slug: true, description: true } });
    return c ? { name: c.name, url: `/kampanya/${c.slug}`, fallbackTitle: c.name, fallbackDesc: c.description } : null;
  }
  if (entityType === "category") {
    const cat = await prisma.category.findUnique({ where: { id: entityId }, select: { name: true, slug: true, description: true } });
    return cat ? { name: cat.name, url: `/urunlerimiz?kategori=${cat.slug}`, fallbackTitle: cat.name, fallbackDesc: cat.description } : null;
  }
  return { name: entityId, url: "/", fallbackTitle: null, fallbackDesc: null };
}

export default async function SeoMetaEditorPage({ params, searchParams }: PageProps) {
  await requirePermission("seo", "edit");
  const { entityType, entityId } = await params;
  const { locale = "tr" } = await searchParams;

  const [entityInfo, seoMeta] = await Promise.all([
    getEntityInfo(entityType, entityId),
    prisma.seoMeta.findUnique({
      where: { entityType_entityId_locale: { entityType, entityId, locale } },
    }).catch(() => null),
  ]);

  if (!entityInfo) notFound();

  return (
    <div className="p-6">
      <div className="mb-5">
        <p className="text-sm text-gray-500">{entityType} / {entityId}</p>
        <h1 className="text-xl font-bold text-gray-900">{entityInfo.name}</h1>
        <a href={entityInfo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:underline">{entityInfo.url} ↗</a>
      </div>
      <SeoMetaEditor
        entityType={entityType}
        entityId={entityId}
        locale={locale}
        initial={seoMeta as Record<string, unknown> | null}
        fallbackTitle={entityInfo.fallbackTitle}
        fallbackDesc={entityInfo.fallbackDesc}
      />
    </div>
  );
}

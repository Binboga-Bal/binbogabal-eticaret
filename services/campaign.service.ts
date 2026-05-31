import { prisma } from "@/lib/prisma";
import { invalidateCampaignCache } from "@/lib/campaign/engine";
import type { CampaignStatus, CampaignType, Prisma } from "@prisma/client";

async function writeAuditLog(campaignId: string, adminId: string, action: string, changes?: object, ip?: string) {
  await prisma.campaignAuditLog.create({
    data: { campaignId, adminId, action, changes: changes ?? undefined, ip },
  });
}

export async function listCampaigns(filters: {
  status?: CampaignStatus;
  type?: CampaignType;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const where: Prisma.CampaignWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { slug: { contains: filters.search } },
    ];
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: { _count: { select: { usages: true, coupons: true } } },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ]);

  return { campaigns, total, page, limit };
}

export async function getCampaign(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      conditions: { orderBy: { sortOrder: "asc" } },
      actions: { orderBy: { sortOrder: "asc" } },
      segments: true,
      targets: true,
      coupons: { take: 10, orderBy: { createdAt: "desc" } },
      abTests: true,
      displays: { orderBy: { sortOrder: "asc" } },
      notifications: { orderBy: { scheduledAt: "asc" } },
      translations: true,
      _count: { select: { usages: true, coupons: true } },
    },
  });
}

export async function createCampaign(data: Prisma.CampaignCreateInput, adminId: string, ip?: string) {
  const campaign = await prisma.campaign.create({ data });
  await writeAuditLog(campaign.id, adminId, "created", undefined, ip);
  invalidateCampaignCache();
  return campaign;
}

export async function updateCampaign(
  id: string,
  data: Prisma.CampaignUpdateInput,
  adminId: string,
  ip?: string,
) {
  const before = await prisma.campaign.findUnique({ where: { id } });
  const campaign = await prisma.campaign.update({ where: { id }, data });
  await writeAuditLog(id, adminId, "updated", { before, after: campaign }, ip);
  invalidateCampaignCache();
  return campaign;
}

export async function deleteCampaign(id: string, adminId: string, ip?: string) {
  await prisma.campaign.update({ where: { id }, data: { status: "CANCELLED" } });
  await writeAuditLog(id, adminId, "cancelled", undefined, ip);
  invalidateCampaignCache();
}

export async function approveCampaign(id: string, adminId: string, ip?: string) {
  const campaign = await prisma.campaign.update({
    where: { id },
    data: { status: "APPROVED", approvedBy: adminId, approvedAt: new Date() },
  });
  await writeAuditLog(id, adminId, "approved", undefined, ip);
  invalidateCampaignCache();
  return campaign;
}

export async function pauseCampaign(id: string, adminId: string, ip?: string) {
  const campaign = await prisma.campaign.update({ where: { id }, data: { status: "PAUSED" } });
  await writeAuditLog(id, adminId, "paused", undefined, ip);
  invalidateCampaignCache();
  return campaign;
}

export async function resumeCampaign(id: string, adminId: string, ip?: string) {
  const campaign = await prisma.campaign.update({ where: { id }, data: { status: "ACTIVE" } });
  await writeAuditLog(id, adminId, "resumed", undefined, ip);
  invalidateCampaignCache();
  return campaign;
}

export async function duplicateCampaign(id: string, adminId: string, ip?: string) {
  const source = await prisma.campaign.findUniqueOrThrow({
    where: { id },
    include: { conditions: true, actions: true, segments: true, targets: true },
  });

  const newSlug = `${source.slug}-kopya-${Date.now()}`;
  const campaign = await prisma.campaign.create({
    data: {
      name: `${source.name} (Kopya)`,
      slug: newSlug,
      description: source.description,
      type: source.type,
      status: "DRAFT",
      priority: source.priority,
      stackable: source.stackable,
      maxDiscountAmount: source.maxDiscountAmount,
      budgetLimit: source.budgetLimit,
      startsAt: source.startsAt,
      endsAt: source.endsAt,
      requiresApproval: source.requiresApproval,
      createdBy: adminId,
      conditions: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        create: source.conditions.map(({ id: _, campaignId: __, ...c }) => ({ ...c, value: c.value as Prisma.InputJsonValue })),
      },
      actions: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        create: source.actions.map(({ id: _, campaignId: __, ...a }) => ({ ...a, value: a.value as Prisma.InputJsonValue })),
      },
      segments: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        create: source.segments.map(({ id: _, campaignId: __, ...s }) => ({ ...s, value: s.value as Prisma.InputJsonValue })),
      },
    },
  });

  await writeAuditLog(campaign.id, adminId, "duplicated", { sourceId: id }, ip);
  return campaign;
}

export async function getCampaignStats(id: string) {
  const [campaign, usages] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: { abTests: true, _count: { select: { usages: true } } },
    }),
    prisma.campaignUsage.findMany({
      where: { campaignId: id },
      orderBy: { usedAt: "asc" },
    }),
  ]);

  if (!campaign) return null;

  const totalDiscount = usages.reduce((s, u) => s + Number(u.discountAmount), 0);
  const uniqueCustomers = new Set(usages.map((u) => u.customerId).filter(Boolean)).size;

  const byDay = usages.reduce<Record<string, number>>((acc, u) => {
    const day = u.usedAt.toISOString().split("T")[0];
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  return {
    campaign,
    usageCount: usages.length,
    totalDiscount,
    uniqueCustomers,
    byDay,
    abTests: campaign.abTests,
    budgetUsed: Number(campaign.budgetUsed),
    budgetLimit: campaign.budgetLimit ? Number(campaign.budgetLimit) : null,
  };
}

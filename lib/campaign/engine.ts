import { prisma } from "@/lib/prisma";
import type { EvaluationContext, CampaignResult, AppliedCampaign, CampaignWithRelations } from "./types";
import { evaluateConditions } from "./condition-evaluator";
import { executeActions } from "./action-executor";
import { matchSegments } from "./segment-matcher";
import { resolveConflicts } from "./conflict-resolver";
import { selectABVariant, getVariantDiscount } from "./ab-router";

// In-memory cache (5 dk TTL)
let campaignCache: { campaigns: CampaignWithRelations[]; cachedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function getActiveCampaigns(): Promise<CampaignWithRelations[]> {
  const now = Date.now();
  if (campaignCache && now - campaignCache.cachedAt < CACHE_TTL) {
    return campaignCache.campaigns;
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      startsAt: { lte: new Date() },
      OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
    },
    include: {
      conditions: true,
      actions: true,
      segments: true,
      abTests: true,
    },
    orderBy: { priority: "desc" },
  });

  campaignCache = { campaigns: campaigns as unknown as CampaignWithRelations[], cachedAt: now };
  return campaignCache.campaigns;
}

export function invalidateCampaignCache() {
  campaignCache = null;
}

export async function evaluateCampaigns(ctx: EvaluationContext): Promise<CampaignResult> {
  const now = ctx.now ?? new Date();
  const activeCampaigns = await getActiveCampaigns();

  // Kupon kodu varsa kupon kampanyasını bul
  let couponCampaign: CampaignWithRelations | null = null;
  if (ctx.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: ctx.couponCode.toUpperCase() },
      include: {
        campaign: {
          include: { conditions: true, actions: true, segments: true, abTests: true },
        },
      },
    });

    if (coupon && coupon.isActive) {
      const expired = coupon.expiresAt && coupon.expiresAt < now;
      const notStarted = coupon.startsAt && coupon.startsAt > now;
      const maxed = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;

      if (!expired && !notStarted && !maxed) {
        if (coupon.campaign) {
          couponCampaign = coupon.campaign as unknown as CampaignWithRelations;
        } else {
          // Kupon direkt, kampanyaya bağlı değil — sentetik kampanya oluştur
          couponCampaign = buildSyntheticCampaign(coupon);
        }
      }
    }
  }

  // Otomatik kampanyaları filtrele (COUPON tipi hariç — onlar kupon kodu gerektirir)
  const autoCampaigns = activeCampaigns.filter((c) => c.type !== "COUPON");

  // Tüm adayları birleştir
  const candidates: CampaignWithRelations[] = [...autoCampaigns];
  if (couponCampaign) candidates.push(couponCampaign);

  // Koşul + segment filtresi
  const eligible = candidates.filter((campaign) => {
    const conditionsOk = evaluateConditions(campaign.conditions, ctx);
    const segmentsOk = matchSegments(campaign.segments, ctx);
    return conditionsOk && segmentsOk;
  });

  // Çakışma çözümü
  const resolved = resolveConflicts(eligible);

  // Aksiyonları çalıştır
  const appliedCampaigns: AppliedCampaign[] = [];
  let totalDiscount = 0;
  let freeShipping = false;
  const allGiftProducts: AppliedCampaign["giftProducts"] = [];
  let cashbackPoints = 0;
  const messages: string[] = [];
  let abVariant: string | undefined;

  for (const campaign of resolved) {
    const variantName = selectABVariant(campaign, ctx.customer?.id);
    if (variantName) abVariant = variantName;

    const result = executeActions(campaign.actions, ctx.cart, campaign.name);

    // A/B test varyant indirimi varsa override
    const variantDiscount = variantName ? getVariantDiscount(campaign, variantName) : undefined;
    let discount = result.discountAmount;
    if (variantDiscount !== undefined) {
      const cartTotal = ctx.cart.reduce((s, i) => s + (i.discountedPrice ?? i.price) * i.quantity, 0);
      discount = cartTotal * (variantDiscount / 100);
    }

    // maxDiscountAmount tavanı
    if (campaign.maxDiscountAmount !== null && campaign.maxDiscountAmount !== undefined) {
      discount = Math.min(discount, Number(campaign.maxDiscountAmount));
    }

    totalDiscount += discount;
    if (result.freeShipping) freeShipping = true;
    allGiftProducts.push(...result.giftProducts);
    cashbackPoints += result.cashbackPoints;
    if (result.message) messages.push(result.message);

    appliedCampaigns.push({
      campaignId: campaign.id,
      campaignName: campaign.name,
      type: campaign.type,
      discountAmount: discount,
      freeShipping: result.freeShipping,
      giftProducts: result.giftProducts,
      cashbackPoints: result.cashbackPoints,
      abVariant: variantName,
      message: result.message,
    });
  }

  return {
    appliedCampaigns,
    totalDiscount,
    freeShipping,
    giftProducts: allGiftProducts,
    cashbackPoints,
    messages,
    abVariant,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSyntheticCampaign(coupon: any): CampaignWithRelations {
  const discountAction = coupon.discountType === "PERCENTAGE"
    ? { type: "PERCENTAGE_DISCOUNT" as const, value: { percentage: Number(coupon.discountValue) } }
    : coupon.discountType === "FREE_SHIPPING"
    ? { type: "FREE_SHIPPING" as const, value: {} }
    : { type: "FIXED_DISCOUNT" as const, value: { amount: Number(coupon.discountValue) } };

  return {
    id: `coupon-${coupon.id}`,
    name: `Kupon: ${coupon.code}`,
    slug: `coupon-${coupon.code}`,
    description: coupon.description,
    internalNote: null,
    type: "COUPON",
    status: "ACTIVE",
    priority: 50,
    stackable: true,
    maxDiscountAmount: coupon.maxDiscount,
    budgetLimit: null,
    budgetUsed: 0 as unknown as import("@prisma/client/runtime/library").Decimal,
    imageUrl: null,
    ogImageUrl: null,
    startsAt: coupon.startsAt ?? new Date(0),
    endsAt: coupon.expiresAt,
    timezone: "Europe/Istanbul",
    requiresApproval: false,
    approvedBy: null,
    approvedAt: null,
    createdBy: "system",
    createdAt: coupon.createdAt,
    updatedAt: coupon.createdAt,
    conditions: coupon.minOrderAmount
      ? [{
          id: "synthetic",
          campaignId: `coupon-${coupon.id}`,
          type: "MIN_CART_AMOUNT" as const,
          operator: "gte",
          value: { amount: Number(coupon.minOrderAmount) },
          logicGroup: 0,
          sortOrder: 0,
        }]
      : [],
    actions: [{
      id: "synthetic-action",
      campaignId: `coupon-${coupon.id}`,
      type: discountAction.type,
      value: discountAction.value,
      sortOrder: 0,
    }],
    segments: [],
    abTests: [],
  };
}

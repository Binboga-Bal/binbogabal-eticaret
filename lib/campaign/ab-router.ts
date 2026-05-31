import type { CampaignWithRelations } from "./types";

// Müşteri ID veya session bazında deterministik varyant seç
export function selectABVariant(campaign: CampaignWithRelations, customerId?: string): string | undefined {
  if (!campaign.abTests || campaign.abTests.length === 0) return undefined;

  const seed = customerId ?? Math.random().toString();
  // Basit deterministik hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100;
  }

  let cumulative = 0;
  for (const variant of campaign.abTests) {
    cumulative += variant.trafficSplit;
    if (hash < cumulative) return variant.variantName;
  }

  return campaign.abTests[0]?.variantName;
}

export function getVariantDiscount(campaign: CampaignWithRelations, variantName: string): number | undefined {
  const variant = campaign.abTests.find((v) => v.variantName === variantName);
  return variant ? Number(variant.discountValue) : undefined;
}

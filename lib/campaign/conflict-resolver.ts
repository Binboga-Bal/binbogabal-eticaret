import type { CampaignWithRelations } from "./types";

// Aktif kampanyaları öncelik + stackable kurallarına göre filtrele
export function resolveConflicts(campaigns: CampaignWithRelations[]): CampaignWithRelations[] {
  // Öncelik büyükten küçüğe sırala
  const sorted = [...campaigns].sort((a, b) => b.priority - a.priority);

  const result: CampaignWithRelations[] = [];
  let hasNonStackable = false;

  for (const campaign of sorted) {
    if (hasNonStackable && !campaign.stackable) {
      // Non-stackable kampanya zaten uygulandı, başka non-stackable ekleme
      continue;
    }
    result.push(campaign);
    if (!campaign.stackable) {
      hasNonStackable = true;
    }
  }

  return result;
}

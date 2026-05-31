import { prisma } from "@/lib/prisma";
import type { CartItem, AppliedCampaign } from "./types";

interface VolumeTier {
  minQty: number;
  discountPercent: number;
}

interface VolumeResult {
  appliedCampaigns: AppliedCampaign[];
  totalDiscount: number;
}

export async function evaluateVolumeDiscounts(cart: CartItem[]): Promise<VolumeResult> {
  const rules = await prisma.volumeDiscount.findMany({
    where: { isActive: true },
    include: {
      products: { select: { productId: true } },
    },
  });

  const appliedCampaigns: AppliedCampaign[] = [];
  let totalDiscount = 0;

  for (const rule of rules) {
    const tiers = (rule.tiers as unknown as VolumeTier[]).sort((a, b) => a.minQty - b.minQty);
    if (!tiers.length) continue;

    // Bu kurala dahil ürünleri belirle (boş = tüm ürünler)
    const eligibleProductIds =
      rule.products.length > 0
        ? new Set(rule.products.map((p) => p.productId))
        : null;

    // Kapsanan sepet kalemleri
    const eligibleItems = cart.filter(
      (item) => !eligibleProductIds || eligibleProductIds.has(item.productId)
    );

    const totalQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

    // En yüksek geçerli kademeyi bul
    const activeTier = [...tiers].reverse().find((t) => totalQty >= t.minQty) ?? null;
    if (!activeTier) continue;

    // İndirim = kapsanan kalemlerin toplamı × oran
    const eligibleSubtotal = eligibleItems.reduce(
      (sum, item) => sum + (item.discountedPrice ?? item.price) * item.quantity,
      0
    );
    const discount = Math.round((eligibleSubtotal * activeTier.discountPercent) / 100 * 100) / 100;

    if (discount <= 0) continue;

    totalDiscount += discount;
    appliedCampaigns.push({
      campaignId: `volume-${rule.id}`,
      campaignName: rule.name,
      type: "VOLUME_DISCOUNT",
      discountAmount: discount,
      freeShipping: false,
      giftProducts: [],
      cashbackPoints: 0,
      message: `${totalQty} ürün → %${activeTier.discountPercent} indirim uygulandı`,
    });
  }

  return { appliedCampaigns, totalDiscount };
}

import type { CampaignAction } from "@prisma/client";
import type { CartItem, AppliedCampaign, GiftProduct } from "./types";

interface ActionResult {
  discountAmount: number;
  freeShipping: boolean;
  giftProducts: GiftProduct[];
  cashbackPoints: number;
  message: string;
}

export function executeActions(
  actions: CampaignAction[],
  cart: CartItem[],
  campaignName: string,
): ActionResult {
  let discountAmount = 0;
  let freeShipping = false;
  const giftProducts: GiftProduct[] = [];
  let cashbackPoints = 0;
  const messages: string[] = [];

  const cartTotal = cart.reduce((sum, i) => sum + (i.discountedPrice ?? i.price) * i.quantity, 0);

  for (const action of actions.sort((a, b) => a.sortOrder - b.sortOrder)) {
    const val = action.value as Record<string, unknown>;

    switch (action.type) {
      case "PERCENTAGE_DISCOUNT": {
        const pct = Number(val.percentage);
        const discount = cartTotal * (pct / 100);
        discountAmount += discount;
        messages.push(`%${pct} indirim uygulandı`);
        break;
      }

      case "FIXED_DISCOUNT": {
        const fixed = Number(val.amount);
        discountAmount += Math.min(fixed, cartTotal);
        messages.push(`${fixed} TL indirim uygulandı`);
        break;
      }

      case "FREE_SHIPPING":
        freeShipping = true;
        messages.push("Ücretsiz kargo uygulandı");
        break;

      case "BUY_X_PAY_Y": {
        const buyX = Number(val.buyX);
        const payY = Number(val.payY);
        // Her buyX ürün grubunda (payY - buyX) adet bedava
        const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
        const freeCount = Math.floor(totalQty / buyX) * (buyX - payY);
        if (freeCount > 0) {
          // En ucuz ürünleri bedava say
          const sorted = [...cart].sort((a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price));
          let remaining = freeCount;
          for (const item of sorted) {
            if (remaining <= 0) break;
            const free = Math.min(item.quantity, remaining);
            discountAmount += (item.discountedPrice ?? item.price) * free;
            remaining -= free;
          }
          messages.push(`${buyX} al ${payY} öde uygulandı`);
        }
        break;
      }

      case "GIFT_PRODUCT": {
        const gift: GiftProduct = {
          productId: val.productId as string,
          variantId: val.variantId as string | undefined,
          quantity: Number(val.quantity ?? 1),
          name: val.productName as string ?? "Hediye ürün",
        };
        giftProducts.push(gift);
        messages.push(`Hediye ürün eklendi: ${gift.name}`);
        break;
      }

      case "CASHBACK_POINTS": {
        const points = Number(val.points ?? 0);
        const pct = Number(val.percentage ?? 0);
        cashbackPoints += points > 0 ? points : Math.floor(cartTotal * (pct / 100));
        messages.push(`${cashbackPoints} puan kazandınız`);
        break;
      }

      case "FREE_PRODUCT": {
        // Sepette belirli ürün varsa onu bedava yap
        const targetProductId = val.productId as string;
        const targetItem = cart.find((i) => i.productId === targetProductId);
        if (targetItem) {
          discountAmount += (targetItem.discountedPrice ?? targetItem.price);
          messages.push(`${targetItem.productName} ücretsiz yapıldı`);
        }
        break;
      }

      case "CATEGORY_DISCOUNT": {
        const categoryId = val.categoryId as string;
        const pct = Number(val.percentage);
        const categoryItems = cart.filter((i) => i.categoryIds.includes(categoryId));
        const catTotal = categoryItems.reduce((s, i) => s + (i.discountedPrice ?? i.price) * i.quantity, 0);
        discountAmount += catTotal * (pct / 100);
        messages.push(`Kategoriye özel %${pct} indirim uygulandı`);
        break;
      }
    }
  }

  return {
    discountAmount,
    freeShipping,
    giftProducts,
    cashbackPoints,
    message: messages.join(", "),
  };
}

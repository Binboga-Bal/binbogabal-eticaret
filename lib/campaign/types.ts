import type { Campaign, CampaignCondition, CampaignAction, CampaignSegment } from "@prisma/client";

export interface CartItem {
  variantId: string;
  productId: string;
  categoryIds: string[];
  quantity: number;
  price: number;          // birim fiyat
  discountedPrice?: number;
  productName: string;
}

export interface EvaluationContext {
  cart: CartItem[];
  customer: {
    id: string;
    email: string;
    createdAt: Date;
    orderCount: number;
    totalSpend: number;
    lastOrderAt?: Date;
    birthDate?: Date;
    city?: string;
  } | null;
  couponCode?: string;
  device?: "mobile" | "desktop";
  city?: string;
  paymentMethod?: string;
  now?: Date;
}

export interface AppliedCampaign {
  campaignId: string;
  campaignName: string;
  type: string;
  discountAmount: number;
  freeShipping: boolean;
  giftProducts: GiftProduct[];
  cashbackPoints: number;
  abVariant?: string;
  message: string;
}

export interface GiftProduct {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
}

export interface CampaignResult {
  appliedCampaigns: AppliedCampaign[];
  totalDiscount: number;
  freeShipping: boolean;
  giftProducts: GiftProduct[];
  cashbackPoints: number;
  messages: string[];
  abVariant?: string;
}

import type { Decimal } from "@prisma/client/runtime/library";

export type CampaignWithRelations = Campaign & {
  conditions: CampaignCondition[];
  actions: CampaignAction[];
  segments: CampaignSegment[];
  abTests: { id: string; variantName: string; trafficSplit: number; discountValue: Decimal | number }[];
};

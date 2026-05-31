import type { CampaignSegment } from "@prisma/client";
import type { EvaluationContext } from "./types";

export function matchSegments(segments: CampaignSegment[], ctx: EvaluationContext): boolean {
  if (segments.length === 0) return true;

  const now = ctx.now ?? new Date();

  return segments.some((segment) => {
    const val = segment.value as Record<string, unknown>;

    switch (segment.type) {
      case "ALL_CUSTOMERS":
        return true;

      case "NEW_CUSTOMERS": {
        if (!ctx.customer) return true; // misafir = yeni
        const daysSince = (now.getTime() - ctx.customer.createdAt.getTime()) / 86400000;
        return daysSince <= 30;
      }

      case "VIP_CUSTOMERS": {
        if (!ctx.customer) return false;
        const threshold = Number(val.minSpend ?? 5000);
        return ctx.customer.totalSpend >= threshold;
      }

      case "INACTIVE_CUSTOMERS": {
        if (!ctx.customer) return false;
        if (!ctx.customer.lastOrderAt) return ctx.customer.orderCount === 0;
        const days = (now.getTime() - ctx.customer.lastOrderAt.getTime()) / 86400000;
        return days >= Number(val.days ?? 90);
      }

      case "BIRTHDAY_THIS_MONTH": {
        if (!ctx.customer?.birthDate) return false;
        return ctx.customer.birthDate.getMonth() === now.getMonth();
      }

      case "SPECIFIC_CUSTOMERS": {
        if (!ctx.customer) return false;
        const ids = val.customerIds as string[];
        return ids.includes(ctx.customer.id);
      }

      case "CUSTOMER_TAG": {
        // Tag sistemi henüz yok; placeholder
        return false;
      }

      case "GEOGRAPHIC_SEGMENT": {
        const cities = val.cities as string[];
        const city = ctx.city ?? ctx.customer?.city ?? "";
        return cities.map((c) => c.toLowerCase()).includes(city.toLowerCase());
      }

      default:
        return false;
    }
  });
}

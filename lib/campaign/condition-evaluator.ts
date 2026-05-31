import type { CampaignCondition } from "@prisma/client";
import type { EvaluationContext } from "./types";

type Operator = "eq" | "gt" | "lt" | "gte" | "lte" | "in" | "contains";

function compare(actual: number, operator: Operator, expected: number): boolean {
  switch (operator) {
    case "eq": return actual === expected;
    case "gt": return actual > expected;
    case "lt": return actual < expected;
    case "gte": return actual >= expected;
    case "lte": return actual <= expected;
    default: return false;
  }
}

function inArray(actual: string, values: string[]): boolean {
  return values.includes(actual);
}

export function evaluateCondition(condition: CampaignCondition, ctx: EvaluationContext): boolean {
  const op = condition.operator as Operator;
  const val = condition.value as Record<string, unknown>;
  const now = ctx.now ?? new Date();

  const cartTotal = ctx.cart.reduce((sum, i) => sum + (i.discountedPrice ?? i.price) * i.quantity, 0);
  const cartCount = ctx.cart.reduce((sum, i) => sum + i.quantity, 0);

  switch (condition.type) {
    case "MIN_CART_AMOUNT":
      return compare(cartTotal, op, Number(val.amount));

    case "MIN_ITEM_COUNT":
      return compare(cartCount, op, Number(val.count));

    case "SPECIFIC_PRODUCTS": {
      const ids = val.productIds as string[];
      return ctx.cart.some((i) => ids.includes(i.productId));
    }

    case "SPECIFIC_CATEGORIES": {
      const ids = val.categoryIds as string[];
      return ctx.cart.some((i) => i.categoryIds.some((c) => ids.includes(c)));
    }

    case "CUSTOMER_SEGMENT":
      // segment-matcher ile değerlendirilir, burada true döner
      return true;

    case "CUSTOMER_ORDER_COUNT":
      if (!ctx.customer) return false;
      return compare(ctx.customer.orderCount, op, Number(val.count));

    case "CUSTOMER_TOTAL_SPEND":
      if (!ctx.customer) return false;
      return compare(ctx.customer.totalSpend, op, Number(val.amount));

    case "FIRST_ORDER":
      if (!ctx.customer) return true; // misafir = ilk
      return ctx.customer.orderCount === 0;

    case "DAY_OF_WEEK": {
      const days = val.days as number[]; // 0=Pazar, 1=Pazartesi...
      return days.includes(now.getDay());
    }

    case "TIME_OF_DAY": {
      const hour = now.getHours();
      const start = Number(val.startHour);
      const end = Number(val.endHour);
      return start <= end ? hour >= start && hour < end : hour >= start || hour < end;
    }

    case "GEOGRAPHIC": {
      const cities = val.cities as string[];
      const city = ctx.city ?? ctx.customer?.city ?? "";
      return inArray(city.toLowerCase(), cities.map((c) => c.toLowerCase()));
    }

    case "DEVICE_TYPE": {
      const devices = val.devices as string[];
      return devices.includes(ctx.device ?? "desktop");
    }

    case "PAYMENT_METHOD": {
      const methods = val.methods as string[];
      return methods.includes(ctx.paymentMethod ?? "");
    }

    case "BIRTHDAY_MONTH":
      if (!ctx.customer?.birthDate) return false;
      return ctx.customer.birthDate.getMonth() === now.getMonth();

    case "DAYS_SINCE_LAST_ORDER": {
      if (!ctx.customer?.lastOrderAt) return op === "gt" || op === "gte" ? true : false;
      const days = Math.floor((now.getTime() - ctx.customer.lastOrderAt.getTime()) / 86400000);
      return compare(days, op, Number(val.days));
    }

    default:
      return false;
  }
}

// Koşulları logic group'a göre grupla (AND içi, OR dışı)
export function evaluateConditions(conditions: CampaignCondition[], ctx: EvaluationContext): boolean {
  if (conditions.length === 0) return true;

  const groups = new Map<number, CampaignCondition[]>();
  for (const c of conditions) {
    const g = c.logicGroup;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(c);
  }

  // Her grup AND; gruplar arası OR
  for (const [, groupConditions] of groups) {
    const groupPasses = groupConditions.every((c) => evaluateCondition(c, ctx));
    if (groupPasses) return true;
  }
  return false;
}

"use client";

import type { ConditionItem, ActionItem } from "./CampaignBuilder";

const TYPE_LABELS: Record<string, string> = {
  CART_DISCOUNT: "Sepet İndirimi",
  COUPON: "Kupon",
  PRODUCT_DISCOUNT: "Ürün İndirimi",
  FREE_SHIPPING: "Ücretsiz Kargo",
  BUY_X_PAY_Y: "X Al Y Öde",
  GIFT_PRODUCT: "Hediye Ürün",
  FLASH_SALE: "Flash Sale",
  CASHBACK: "Cashback",
  BIRTHDAY: "Doğum Günü",
  WIN_BACK: "Geri Kazanım",
  ABANDONED_CART: "Terk Edilmiş Sepet",
};

function buildSummary(
  form: { name: string; type: string; stackable: boolean; maxDiscountAmount: string; budgetLimit: string },
  conditions: ConditionItem[],
  actions: ActionItem[],
): string {
  if (!form.name) return "Kampanya adı girin...";

  const parts: string[] = [];

  // Koşullar
  const condParts: string[] = [];
  for (const c of conditions) {
    const v = c.value;
    if (c.type === "MIN_CART_AMOUNT" && v.amount) condParts.push(`${v.amount} TL üzeri sepet`);
    if (c.type === "MIN_ITEM_COUNT" && v.count) condParts.push(`${v.count}+ ürün`);
    if (c.type === "FIRST_ORDER") condParts.push("ilk sipariş");
    if (c.type === "CUSTOMER_ORDER_COUNT" && v.count) condParts.push(`${v.count}+ sipariş geçmişi`);
    if (c.type === "BIRTHDAY_MONTH") condParts.push("doğum günü ayı");
  }

  // Aksiyonlar
  const actParts: string[] = [];
  for (const a of actions) {
    const v = a.value;
    if (a.type === "PERCENTAGE_DISCOUNT" && v.percentage) actParts.push(`%${v.percentage} indirim`);
    if (a.type === "FIXED_DISCOUNT" && v.amount) actParts.push(`${v.amount} TL indirim`);
    if (a.type === "FREE_SHIPPING") actParts.push("ücretsiz kargo");
    if (a.type === "BUY_X_PAY_Y" && v.buyX && v.payY) actParts.push(`${v.buyX} al ${v.payY} öde`);
    if (a.type === "GIFT_PRODUCT" && v.productName) actParts.push(`${v.productName} hediye`);
    if (a.type === "CASHBACK_POINTS") actParts.push("puan kazan");
  }

  if (condParts.length > 0) parts.push(condParts.join(" ve "));
  if (actParts.length > 0) parts.push(actParts.join(", ") + " uygular");
  if (form.maxDiscountAmount) parts.push(`(maks. ${form.maxDiscountAmount} TL)`);
  if (form.stackable) parts.push("• Diğer kampanyalarla birleşebilir");

  return parts.length > 0
    ? `"${form.name}" kampanyası: ${parts.join(" → ")}.`
    : `"${form.name}" — ${TYPE_LABELS[form.type] ?? form.type} kampanyası.`;
}

interface Props {
  form: { name: string; type: string; stackable: boolean; maxDiscountAmount: string; budgetLimit: string; startsAt: string; endsAt: string };
  conditions: ConditionItem[];
  actions: ActionItem[];
}

export function PreviewPanel({ form, conditions, actions }: Props) {
  const summary = buildSummary(form, conditions, actions);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 sticky top-0 overflow-hidden">
      <div className="px-4 py-3 border-b bg-amber-50/50">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Önizleme</p>
      </div>
      <div className="p-4 space-y-4">
        {/* Özet */}
        <div className="bg-honey-cream/50 rounded-xl p-3">
          <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
        </div>

        {/* Koşullar listesi */}
        {conditions.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-2">IF</p>
            <div className="space-y-1">
              {conditions.map((c, i) => (
                <div key={c.id} className="text-[10px] text-gray-600 flex items-center gap-1.5">
                  {i > 0 && (
                    <span className={`font-bold text-[8px] px-1 py-0.5 rounded ${
                      c.logicGroup === conditions[i - 1]?.logicGroup ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {c.logicGroup === conditions[i - 1]?.logicGroup ? "VE" : "VEYA"}
                    </span>
                  )}
                  <span>{c.type.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aksiyonlar listesi */}
        {actions.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-2">THEN</p>
            <div className="space-y-1">
              {actions.map((a) => (
                <div key={a.id} className="text-[10px] text-gray-600">
                  {a.type.replace(/_/g, " ")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zaman */}
        {(form.startsAt || form.endsAt) && (
          <div className="text-[10px] text-gray-400 border-t pt-3 space-y-1">
            {form.startsAt && <p>Başlangıç: {new Date(form.startsAt).toLocaleDateString("tr-TR")}</p>}
            {form.endsAt && <p>Bitiş: {new Date(form.endsAt).toLocaleDateString("tr-TR")}</p>}
          </div>
        )}

        {/* Budget */}
        {form.budgetLimit && (
          <div className="bg-gray-50 rounded-lg p-2 text-[10px] text-gray-600">
            Bütçe limiti: {Number(form.budgetLimit).toLocaleString("tr-TR")} TL
          </div>
        )}
      </div>
    </div>
  );
}

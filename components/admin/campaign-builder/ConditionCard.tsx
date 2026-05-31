"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { ConditionItem } from "./CampaignBuilder";

const CONDITION_LABELS: Record<string, string> = {
  MIN_CART_AMOUNT: "Min. Sepet Tutarı",
  MIN_ITEM_COUNT: "Min. Ürün Adedi",
  SPECIFIC_PRODUCTS: "Belirli Ürünler",
  SPECIFIC_CATEGORIES: "Belirli Kategoriler",
  CUSTOMER_ORDER_COUNT: "Sipariş Sayısı",
  CUSTOMER_TOTAL_SPEND: "Toplam Harcama",
  FIRST_ORDER: "İlk Sipariş",
  DAY_OF_WEEK: "Haftanın Günü",
  TIME_OF_DAY: "Günün Saati",
  GEOGRAPHIC: "Coğrafi",
  BIRTHDAY_MONTH: "Doğum Ayı",
  DAYS_SINCE_LAST_ORDER: "Son Sipariş Süresi",
  CUSTOMER_SEGMENT: "Müşteri Segmenti",
  SPECIFIC_BRANDS: "Markalar",
  DEVICE_TYPE: "Cihaz Tipi",
  PAYMENT_METHOD: "Ödeme Yöntemi",
};

const OPERATORS = [
  { value: "eq", label: "=" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
  { value: "in", label: "içinde" },
];

interface Props {
  item: ConditionItem;
  onUpdate: (patch: Partial<ConditionItem>) => void;
  onRemove: () => void;
  onGroupChange: (group: number) => void;
}

export function ConditionCard({ item, onUpdate, onRemove, onGroupChange }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const val = item.value;

  function setVal(key: string, value: unknown) {
    onUpdate({ value: { ...val, [key]: value } });
  }

  return (
    <div ref={setNodeRef} style={style} className="border border-blue-100 rounded-xl bg-blue-50/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div {...listeners} {...attributes} className="cursor-grab text-gray-300 hover:text-gray-500">
          <GripVertical size={14} />
        </div>
        <span className="text-xs font-semibold text-blue-800 flex-1">{CONDITION_LABELS[item.type] ?? item.type}</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">Grup</span>
          <input
            type="number"
            min={0}
            max={5}
            value={item.logicGroup}
            onChange={(e) => onGroupChange(Number(e.target.value))}
            className="w-8 border border-gray-200 rounded text-xs text-center px-1 py-0.5"
          />
        </div>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-500">
          <X size={14} />
        </button>
      </div>

      {/* Tip'e göre form alanları */}
      <div className="space-y-1.5">
        {(item.type === "MIN_CART_AMOUNT" || item.type === "CUSTOMER_TOTAL_SPEND") && (
          <div className="flex gap-2">
            <select
              value={item.operator}
              onChange={(e) => onUpdate({ operator: e.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
            >
              {OPERATORS.filter((o) => ["eq","gt","gte","lt","lte"].includes(o.value)).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Tutar (TL)"
              value={(val.amount as string) ?? ""}
              onChange={(e) => setVal("amount", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        )}

        {(item.type === "MIN_ITEM_COUNT" || item.type === "CUSTOMER_ORDER_COUNT") && (
          <div className="flex gap-2">
            <select
              value={item.operator}
              onChange={(e) => onUpdate({ operator: e.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
            >
              {OPERATORS.filter((o) => ["eq","gt","gte","lt","lte"].includes(o.value)).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Adet"
              value={(val.count as string) ?? ""}
              onChange={(e) => setVal("count", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        )}

        {item.type === "DAYS_SINCE_LAST_ORDER" && (
          <div className="flex gap-2">
            <select
              value={item.operator}
              onChange={(e) => onUpdate({ operator: e.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
            >
              {OPERATORS.filter((o) => ["gt","gte"].includes(o.value)).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Gün sayısı"
              value={(val.days as string) ?? ""}
              onChange={(e) => setVal("days", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        )}

        {item.type === "DAY_OF_WEEK" && (
          <div className="flex flex-wrap gap-1">
            {["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"].map((day, i) => {
              const days = (val.days as number[]) ?? [];
              const checked = days.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => setVal("days", checked ? days.filter((d) => d !== i) : [...days, i])}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border ${checked ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        )}

        {item.type === "TIME_OF_DAY" && (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={0}
              max={23}
              placeholder="Başlangıç saati"
              value={(val.startHour as string) ?? ""}
              onChange={(e) => setVal("startHour", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-xs text-gray-400">—</span>
            <input
              type="number"
              min={0}
              max={23}
              placeholder="Bitiş saati"
              value={(val.endHour as string) ?? ""}
              onChange={(e) => setVal("endHour", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        )}

        {(item.type === "GEOGRAPHIC" || item.type === "SPECIFIC_PRODUCTS" || item.type === "SPECIFIC_CATEGORIES") && (
          <textarea
            placeholder={
              item.type === "GEOGRAPHIC" ? "İstanbul, Ankara (virgülle)"
              : item.type === "SPECIFIC_PRODUCTS" ? "Ürün ID'leri (virgülle)"
              : "Kategori ID'leri (virgülle)"
            }
            value={
              item.type === "GEOGRAPHIC"
                ? ((val.cities as string[]) ?? []).join(", ")
                : item.type === "SPECIFIC_PRODUCTS"
                ? ((val.productIds as string[]) ?? []).join(", ")
                : ((val.categoryIds as string[]) ?? []).join(", ")
            }
            onChange={(e) => {
              const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
              if (item.type === "GEOGRAPHIC") setVal("cities", arr);
              else if (item.type === "SPECIFIC_PRODUCTS") setVal("productIds", arr);
              else setVal("categoryIds", arr);
            }}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs resize-none"
          />
        )}

        {item.type === "FIRST_ORDER" && (
          <p className="text-[10px] text-blue-600">Müşterinin ilk siparişinde uygulanır</p>
        )}
        {item.type === "BIRTHDAY_MONTH" && (
          <p className="text-[10px] text-blue-600">Bu ay doğum günü olan müşterilere uygulanır</p>
        )}
      </div>

      {/* Logic group göstergesi */}
      <div className="mt-2 text-[10px] text-gray-400">
        Grup {item.logicGroup} — {item.logicGroup === 0 ? "Ana koşul (AND)" : `Alternatif grup ${item.logicGroup} (OR)`}
      </div>
    </div>
  );
}

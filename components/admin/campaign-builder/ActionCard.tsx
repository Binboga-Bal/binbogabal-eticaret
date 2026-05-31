"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { ActionItem } from "./CampaignBuilder";

const ACTION_LABELS: Record<string, string> = {
  PERCENTAGE_DISCOUNT: "% İndirim",
  FIXED_DISCOUNT: "Sabit İndirim (TL)",
  FREE_SHIPPING: "Ücretsiz Kargo",
  BUY_X_PAY_Y: "X Al Y Öde",
  GIFT_PRODUCT: "Hediye Ürün",
  CASHBACK_POINTS: "Puan Kazan",
  FREE_PRODUCT: "Ürün Bedava",
  CATEGORY_DISCOUNT: "Kategori İndirimi",
};

interface Props {
  item: ActionItem;
  onUpdate: (patch: Partial<ActionItem>) => void;
  onRemove: () => void;
}

export function ActionCard({ item, onUpdate, onRemove }: Props) {
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
    <div ref={setNodeRef} style={style} className="border border-green-100 rounded-xl bg-green-50/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div {...listeners} {...attributes} className="cursor-grab text-gray-300 hover:text-gray-500">
          <GripVertical size={14} />
        </div>
        <span className="text-xs font-semibold text-green-800 flex-1">{ACTION_LABELS[item.type] ?? item.type}</span>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-500">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1.5">
        {item.type === "PERCENTAGE_DISCOUNT" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              placeholder="İndirim %"
              value={(val.percentage as string) ?? ""}
              onChange={(e) => setVal("percentage", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        )}

        {item.type === "FIXED_DISCOUNT" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              placeholder="İndirim tutarı"
              value={(val.amount as string) ?? ""}
              onChange={(e) => setVal("amount", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-xs text-gray-500">TL</span>
          </div>
        )}

        {item.type === "FREE_SHIPPING" && (
          <p className="text-[10px] text-green-700">Kargo ücretini sıfırlar</p>
        )}

        {item.type === "BUY_X_PAY_Y" && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500">Al (X)</label>
              <input
                type="number"
                min={2}
                value={(val.buyX as string) ?? "3"}
                onChange={(e) => setVal("buyX", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-500">Öde (Y)</label>
              <input
                type="number"
                min={1}
                value={(val.payY as string) ?? "2"}
                onChange={(e) => setVal("payY", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
              />
            </div>
          </div>
        )}

        {item.type === "GIFT_PRODUCT" && (
          <div className="space-y-1.5">
            <input
              placeholder="Ürün adı"
              value={(val.productName as string) ?? ""}
              onChange={(e) => setVal("productName", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
            <input
              placeholder="Ürün ID"
              value={(val.productId as string) ?? ""}
              onChange={(e) => setVal("productId", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        )}

        {item.type === "CASHBACK_POINTS" && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Sabit puan"
              value={(val.points as string) ?? ""}
              onChange={(e) => setVal("points", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-xs text-gray-400 self-center">VEYA</span>
            <input
              type="number"
              placeholder="% puan"
              value={(val.percentage as string) ?? ""}
              onChange={(e) => setVal("percentage", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        )}

        {item.type === "CATEGORY_DISCOUNT" && (
          <div className="flex gap-2">
            <input
              placeholder="Kategori ID"
              value={(val.categoryId as string) ?? ""}
              onChange={(e) => setVal("categoryId", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
            <input
              type="number"
              placeholder="%"
              value={(val.percentage as string) ?? ""}
              onChange={(e) => setVal("percentage", e.target.value)}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}

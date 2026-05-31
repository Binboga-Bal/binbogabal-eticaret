"use client";

import type { ActionType } from "@prisma/client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const ACTIONS: { type: ActionType; label: string; description: string }[] = [
  { type: "PERCENTAGE_DISCOUNT", label: "% İndirim", description: "Sepete yüzde indirim" },
  { type: "FIXED_DISCOUNT", label: "Sabit İndirim (TL)", description: "Sabit tutar indirim" },
  { type: "FREE_SHIPPING", label: "Ücretsiz Kargo", description: "Kargo ücretini sil" },
  { type: "BUY_X_PAY_Y", label: "X Al Y Öde", description: "3 al 2 öde gibi" },
  { type: "GIFT_PRODUCT", label: "Hediye Ürün", description: "Sepete bedava ürün ekle" },
  { type: "CASHBACK_POINTS", label: "Puan Kazan", description: "Alışverişe puan ekle" },
  { type: "FREE_PRODUCT", label: "Ürün Bedava", description: "Belirli ürünü ücretsiz yap" },
  { type: "CATEGORY_DISCOUNT", label: "Kategori İndirimi", description: "Kategoriye özel indirim" },
];

function DraggableAction({ type, label, description, onAdd }: {
  type: ActionType;
  label: string;
  description: string;
  onAdd: (type: ActionType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `panel-act-${type}`,
    data: { source: "panel", itemType: "action", actionType: type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-2.5 rounded-xl border border-gray-100 bg-white hover:border-green-200 hover:bg-green-50/30 cursor-grab group"
    >
      <div {...listeners} {...attributes} className="mt-0.5 text-gray-300 group-hover:text-gray-400">
        <GripVertical size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onAdd(type)}
        className="text-[10px] text-green-700 font-bold opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        +
      </button>
    </div>
  );
}

export function ActionPanel({ onAdd }: { onAdd: (type: ActionType) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b bg-green-50/50">
        <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Aksiyonlar (THEN)</p>
      </div>
      <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
        {ACTIONS.map((a) => (
          <DraggableAction key={a.type} {...a} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}

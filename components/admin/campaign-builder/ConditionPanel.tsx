"use client";

import type { ConditionType } from "@prisma/client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const CONDITIONS: { type: ConditionType; label: string; description: string }[] = [
  { type: "MIN_CART_AMOUNT", label: "Min. Sepet Tutarı", description: "Belirli tutarın üzeri" },
  { type: "MIN_ITEM_COUNT", label: "Min. Ürün Adedi", description: "Belirli adet ve üzeri" },
  { type: "SPECIFIC_PRODUCTS", label: "Belirli Ürünler", description: "Seçili ürünler sepette" },
  { type: "SPECIFIC_CATEGORIES", label: "Belirli Kategoriler", description: "Seçili kategoriden ürün" },
  { type: "CUSTOMER_ORDER_COUNT", label: "Sipariş Sayısı", description: "Geçmiş sipariş koşulu" },
  { type: "CUSTOMER_TOTAL_SPEND", label: "Toplam Harcama", description: "Toplam harcama koşulu" },
  { type: "FIRST_ORDER", label: "İlk Sipariş", description: "Müşterinin ilk siparişi" },
  { type: "DAY_OF_WEEK", label: "Haftanın Günü", description: "Belirli günlerde geçerli" },
  { type: "TIME_OF_DAY", label: "Günün Saati", description: "Belirli saatlerde geçerli" },
  { type: "GEOGRAPHIC", label: "Coğrafi", description: "Belirli şehirler" },
  { type: "BIRTHDAY_MONTH", label: "Doğum Ayı", description: "Bu ay doğum günü olanlar" },
  { type: "DAYS_SINCE_LAST_ORDER", label: "Son Sipariş Süresi", description: "X gündür alışveriş yok" },
];

function DraggableCondition({ type, label, description, onAdd }: {
  type: ConditionType;
  label: string;
  description: string;
  onAdd: (type: ConditionType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `panel-cond-${type}`,
    data: { source: "panel", itemType: "condition", conditionType: type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-2.5 rounded-xl border border-gray-100 bg-white hover:border-honey/30 hover:bg-honey-cream/30 cursor-grab group"
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
        className="text-[10px] text-honey-dark font-bold opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        +
      </button>
    </div>
  );
}

export function ConditionPanel({ onAdd }: { onAdd: (type: ConditionType) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b bg-blue-50/50">
        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Koşullar (IF)</p>
      </div>
      <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
        {CONDITIONS.map((c) => (
          <DraggableCondition key={c.type} {...c} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}

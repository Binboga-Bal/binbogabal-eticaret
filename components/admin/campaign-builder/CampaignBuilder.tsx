"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { ConditionPanel } from "./ConditionPanel";
import { ActionPanel } from "./ActionPanel";
import { BuilderCanvas, handleCanvasDragEnd } from "./BuilderCanvas";
import { PreviewPanel } from "./PreviewPanel";
import type { ConditionType, ActionType, CampaignType } from "@prisma/client";

export interface ConditionItem {
  id: string;
  type: ConditionType;
  operator: string;
  value: Record<string, unknown>;
  logicGroup: number;
  sortOrder: number;
}

export interface ActionItem {
  id: string;
  type: ActionType;
  value: Record<string, unknown>;
  sortOrder: number;
}

interface CampaignFormData {
  name: string;
  slug: string;
  description: string;
  type: CampaignType;
  priority: number;
  stackable: boolean;
  requiresApproval: boolean;
  maxDiscountAmount: string;
  budgetLimit: string;
  startsAt: string;
  endsAt: string;
}

const DEFAULT_FORM: CampaignFormData = {
  name: "",
  slug: "",
  description: "",
  type: "CART_DISCOUNT",
  priority: 0,
  stackable: false,
  requiresApproval: false,
  maxDiscountAmount: "",
  budgetLimit: "",
  startsAt: "",
  endsAt: "",
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CampaignBuilder({ initialData }: { initialData?: Partial<CampaignFormData & { conditions: ConditionItem[]; actions: ActionItem[]; id: string }> }) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState<CampaignFormData>({
    ...DEFAULT_FORM,
    ...initialData,
  });
  const [conditions, setConditions] = useState<ConditionItem[]>(initialData?.conditions ?? []);
  const [actions, setActions] = useState<ActionItem[]>(initialData?.actions ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleFormChange(field: keyof CampaignFormData, value: string | boolean | number) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "name") next.slug = slugify(value as string);
      return next;
    });
  }

  function addCondition(type: ConditionType) {
    setConditions((prev) => [
      ...prev,
      {
        id: `cond-${Date.now()}`,
        type,
        operator: "gte",
        value: {},
        logicGroup: 0,
        sortOrder: prev.length,
      },
    ]);
  }

  function addAction(type: ActionType) {
    setActions((prev) => [
      ...prev,
      {
        id: `act-${Date.now()}`,
        type,
        value: {},
        sortOrder: prev.length,
      },
    ]);
  }

  async function handleSave(status: "DRAFT" | "ACTIVE" | "PENDING_APPROVAL") {
    if (!form.name || !form.startsAt) {
      setError("Kampanya adı ve başlangıç tarihi zorunludur.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      status,
      priority: Number(form.priority),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      budgetLimit: form.budgetLimit ? Number(form.budgetLimit) : null,
      conditions: conditions.map(({ id: _, ...c }) => c),
      actions: actions.map(({ id: _, ...a }) => a),
    };

    const url = isEdit ? `/api/admin/campaigns/${initialData!.id}` : "/api/admin/campaigns";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Bir hata oluştu.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/kampanyalar/${data.id}`);
    router.refresh();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={(e) => handleCanvasDragEnd(e, conditions, actions, setConditions, setActions)}
    >
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Sol panel */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        <ConditionPanel onAdd={addCondition} />
        <ActionPanel onAdd={addAction} />
      </div>

      {/* Ana canvas */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Form alanları */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Kampanya Bilgileri</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kampanya Adı *</label>
              <input
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Yaz İndirimi"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => handleFormChange("slug", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tip *</label>
              <select
                value={form.type}
                onChange={(e) => handleFormChange("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              >
                <option value="CART_DISCOUNT">Sepet İndirimi</option>
                <option value="COUPON">Kupon</option>
                <option value="PRODUCT_DISCOUNT">Ürün İndirimi</option>
                <option value="FREE_SHIPPING">Ücretsiz Kargo</option>
                <option value="BUY_X_PAY_Y">X Al Y Öde</option>
                <option value="GIFT_PRODUCT">Hediye Ürün</option>
                <option value="FLASH_SALE">Flash Sale</option>
                <option value="CASHBACK">Cashback</option>
                <option value="BIRTHDAY">Doğum Günü</option>
                <option value="WIN_BACK">Geri Kazanım</option>
                <option value="ABANDONED_CART">Terk Edilmiş Sepet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Öncelik</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => handleFormChange("priority", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              />
            </div>
            <div className="flex flex-col gap-2 pt-5">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.stackable}
                  onChange={(e) => handleFormChange("stackable", e.target.checked)}
                  className="accent-honey"
                />
                Biriktirilebilir
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requiresApproval}
                  onChange={(e) => handleFormChange("requiresApproval", e.target.checked)}
                  className="accent-honey"
                />
                Onay Gerektirir
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç *</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => handleFormChange("startsAt", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => handleFormChange("endsAt", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Maks. İndirim (TL)</label>
              <input
                type="number"
                value={form.maxDiscountAmount}
                onChange={(e) => handleFormChange("maxDiscountAmount", e.target.value)}
                placeholder="Sınırsız"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bütçe Limiti (TL)</label>
              <input
                type="number"
                value={form.budgetLimit}
                onChange={(e) => handleFormChange("budgetLimit", e.target.value)}
                placeholder="Sınırsız"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-honey resize-none"
            />
          </div>
        </div>

        {/* Koşul & Aksiyon canvas */}
        <BuilderCanvas
          conditions={conditions}
          actions={actions}
          onConditionsChange={setConditions}
          onActionsChange={setActions}
        />

        {/* Hata & Kaydet */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Taslak Kaydet
          </button>
          {form.requiresApproval ? (
            <button
              onClick={() => handleSave("PENDING_APPROVAL")}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              Onaya Gönder
            </button>
          ) : (
            <button
              onClick={() => handleSave("ACTIVE")}
              disabled={saving}
              className="px-5 py-2.5 bg-honey text-white rounded-xl text-sm font-bold hover:bg-honey-dark disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Yayınla"}
            </button>
          )}
        </div>
      </div>

      {/* Sağ panel — önizleme */}
      <div className="w-64 flex-shrink-0">
        <PreviewPanel form={form} conditions={conditions} actions={actions} />
      </div>
    </div>
    </DndContext>
  );
}

"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Save, Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface VitrinProduct {
  id: string;
  name: string;
  slug: string;
  images: unknown;
  isBestseller: boolean;
  isFeatured: boolean;
  bestsellOrder: number;
  featuredOrder: number;
  isActive: boolean;
}

interface Props {
  bestsellers: VitrinProduct[];
  featured: VitrinProduct[];
  allProducts: VitrinProduct[];
}

// ── Draggable row ──────────────────────────────────────────────────────────────
function SortableRow({
  product,
  onRemove,
}: {
  product: VitrinProduct;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const thumb = (Array.isArray(product.images) ? product.images[0] : null) as string | null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
        type="button"
      >
        <GripVertical size={18} />
      </button>
      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
        {thumb ? (
          <Image src={thumb} alt={product.name} width={40} height={40} className="object-contain w-full h-full p-0.5" />
        ) : (
          <span className="flex items-center justify-center h-full text-xl">🍯</span>
        )}
      </div>
      <span className="flex-1 text-sm font-medium text-gray-800 truncate">{product.name}</span>
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// ── Per-vitrin panel ───────────────────────────────────────────────────────────
function VitrinPanel({
  type,
  label,
  items,
  allProducts,
  onChange,
}: {
  type: "bestsellers" | "featured";
  label: string;
  items: VitrinProduct[];
  allProducts: VitrinProduct[];
  onChange: (type: "bestsellers" | "featured", newList: VitrinProduct[]) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = items.findIndex((p) => p.id === active.id);
      const newIndex = items.findIndex((p) => p.id === over.id);
      onChange(type, arrayMove(items, oldIndex, newIndex));
    },
    [items, onChange, type]
  );

  const handleRemove = useCallback(
    (id: string) => onChange(type, items.filter((p) => p.id !== id)),
    [items, onChange, type]
  );

  const handleAdd = useCallback(
    (product: VitrinProduct) => {
      if (items.some((p) => p.id === product.id)) return;
      onChange(type, [...items, product]);
      setSearchOpen(false);
      setQuery("");
    },
    [items, onChange, type]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/vitrins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, items: items.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const addableProduts = allProducts.filter(
    (p) => !items.some((i) => i.id === p.id) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{label}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {items.length} ürün — sürükleyerek sıralayın
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setSearchOpen(true); setQuery(""); }}
          >
            <Plus size={14} className="mr-1" />
            Ürün Ekle
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin mr-1" />
            ) : (
              <Save size={14} className="mr-1" />
            )}
            {saved ? "Kaydedildi ✓" : "Kaydet"}
          </Button>
        </div>
      </div>

      {/* Product picker */}
      {searchOpen && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-lg px-3">
              <Search size={14} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Ürün ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 py-2 text-sm outline-none bg-transparent"
              />
            </div>
            <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {addableProduts.length === 0 ? (
              <p className="text-sm text-gray-400 py-2 text-center">
                {query ? "Sonuç bulunamadı" : "Tüm ürünler eklendi"}
              </p>
            ) : (
              addableProduts.map((p) => {
                const thumb = (Array.isArray(p.images) ? p.images[0] : null) as string | null;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAdd(p)}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      {thumb ? (
                        <Image src={thumb} alt={p.name} width={32} height={32} className="object-contain w-full h-full" />
                      ) : (
                        <span className="flex items-center justify-center h-full text-sm">🍯</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 truncate">{p.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Draggable list */}
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center text-sm text-gray-400">
          Henüz ürün eklenmedi. &ldquo;Ürün Ekle&rdquo; ile başlayın.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {items.map((product) => (
                <SortableRow key={product.id} product={product} onRemove={handleRemove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function VitrinManager({ bestsellers: init_bs, featured: init_ft, allProducts }: Props) {
  const [bestsellers, setBestsellers] = useState(init_bs);
  const [featured, setFeatured] = useState(init_ft);

  const handleChange = useCallback(
    (type: "bestsellers" | "featured", newList: VitrinProduct[]) => {
      if (type === "bestsellers") setBestsellers(newList);
      else setFeatured(newList);
    },
    []
  );

  return (
    <div className="space-y-6">
      <VitrinPanel
        type="bestsellers"
        label="Çok Satanlar Vitrini"
        items={bestsellers}
        allProducts={allProducts}
        onChange={handleChange}
      />
      <VitrinPanel
        type="featured"
        label="Avantajlı Ürünler Vitrini"
        items={featured}
        allProducts={allProducts}
        onChange={handleChange}
      />
    </div>
  );
}

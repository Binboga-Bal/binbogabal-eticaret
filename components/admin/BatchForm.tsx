"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";

type FloraItem = {
  name: string;
  percentage: string;
  type: "dominant" | "sekonder" | "minör";
};

type BatchFormData = {
  batchNumber: string;
  productName: string;
  productionDate: string;
  analysisDate: string;
  expiryDate: string;
  moistureContent: string;
  hmfValue: string;
  diastaseActivity: string;
  electricalConductivity: string;
  sucroseContent: string;
  ph: string;
  floraItems: FloraItem[];
  floraNotes: string;
  laboratoryName: string;
  isActive: boolean;
};

type Props = {
  initialData?: Partial<BatchFormData & { id: string }>;
};

const emptyForm: BatchFormData = {
  batchNumber: "",
  productName: "",
  productionDate: "",
  analysisDate: "",
  expiryDate: "",
  moistureContent: "",
  hmfValue: "",
  diastaseActivity: "",
  electricalConductivity: "",
  sucroseContent: "",
  ph: "",
  floraItems: [],
  floraNotes: "",
  laboratoryName: "",
  isActive: true,
};

function toDateInput(val: string | Date | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
}

export function BatchForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState<BatchFormData>({
    ...emptyForm,
    ...initialData,
    productionDate: toDateInput(initialData?.productionDate),
    analysisDate: toDateInput(initialData?.analysisDate),
    expiryDate: toDateInput(initialData?.expiryDate),
    floraItems: (initialData?.floraItems as FloraItem[]) ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof BatchFormData>(key: K, val: BatchFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addFloraRow() {
    setField("floraItems", [...form.floraItems, { name: "", percentage: "", type: "minör" }]);
  }

  function removeFloraRow(i: number) {
    setField("floraItems", form.floraItems.filter((_, idx) => idx !== i));
  }

  function updateFlora(i: number, key: keyof FloraItem, val: string) {
    const updated = form.floraItems.map((item, idx) =>
      idx === i ? { ...item, [key]: val } : item,
    );
    setField("floraItems", updated as FloraItem[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const url = isEdit ? `/api/admin/batches/${initialData!.id}` : "/api/admin/batches";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Bir hata oluştu");
      setSaving(false);
      return;
    }

    router.push("/admin/analiz-raporlari");
    router.refresh();
  }

  const fieldClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Temel Bilgiler */}
      <section>
        <h2 className="font-bold text-gray-800 mb-4 pb-2 border-b">Temel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Parti Numarası *"
            value={form.batchNumber}
            onChange={(e) => setField("batchNumber", e.target.value)}
            placeholder="159-06"
            required
          />
          <Input
            label="Ürün Adı *"
            value={form.productName}
            onChange={(e) => setField("productName", e.target.value)}
            placeholder="Kızılçam Balı"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Üretim Tarihi *</label>
            <input
              type="date"
              value={form.productionDate}
              onChange={(e) => setField("productionDate", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Analiz Tarihi *</label>
            <input
              type="date"
              value={form.analysisDate}
              onChange={(e) => setField("analysisDate", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tavsiye Edilen Tüketim Tarihi *
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setField("expiryDate", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <Input
            label="Laboratuvar Adı"
            value={form.laboratoryName}
            onChange={(e) => setField("laboratoryName", e.target.value)}
            placeholder="ABC Analiz Laboratuvarı"
          />
        </div>
      </section>

      {/* Kalite Değerleri */}
      <section>
        <h2 className="font-bold text-gray-800 mb-4 pb-2 border-b">Kalite Değerleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nem Oranı (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.moistureContent}
              onChange={(e) => setField("moistureContent", e.target.value)}
              className={fieldClass}
              placeholder="17.50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HMF (mg/kg)</label>
            <input
              type="number"
              step="0.01"
              value={form.hmfValue}
              onChange={(e) => setField("hmfValue", e.target.value)}
              className={fieldClass}
              placeholder="8.20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diyastaz Aktivitesi (DN)</label>
            <input
              type="number"
              step="0.01"
              value={form.diastaseActivity}
              onChange={(e) => setField("diastaseActivity", e.target.value)}
              className={fieldClass}
              placeholder="18.40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Elektrik İletkenliği (mS/cm)</label>
            <input
              type="number"
              step="0.001"
              value={form.electricalConductivity}
              onChange={(e) => setField("electricalConductivity", e.target.value)}
              className={fieldClass}
              placeholder="0.820"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sakaroz (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.sucroseContent}
              onChange={(e) => setField("sucroseContent", e.target.value)}
              className={fieldClass}
              placeholder="2.10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
            <input
              type="number"
              step="0.01"
              value={form.ph}
              onChange={(e) => setField("ph", e.target.value)}
              className={fieldClass}
              placeholder="3.85"
            />
          </div>
        </div>
      </section>

      {/* Flora / Polen Analizi */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h2 className="font-bold text-gray-800">Flora / Polen Analizi</h2>
          <button
            type="button"
            onClick={addFloraRow}
            className="flex items-center gap-1.5 text-sm text-honey-dark hover:text-honey font-medium"
          >
            <Plus size={16} />
            Polen Ekle
          </button>
        </div>

        {form.floraItems.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-[1fr_100px_120px_36px] gap-2 text-xs font-medium text-gray-500 px-1">
              <span>Bitki / Polen Adı</span>
              <span>Oran (%)</span>
              <span>Tip</span>
              <span />
            </div>
            {form.floraItems.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_120px_36px] gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateFlora(i, "name", e.target.value)}
                  className={fieldClass}
                  placeholder="Kızılçam"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.percentage}
                  onChange={(e) => updateFlora(i, "percentage", e.target.value)}
                  className={fieldClass}
                  placeholder="65"
                />
                <select
                  value={item.type}
                  onChange={(e) => updateFlora(i, "type", e.target.value)}
                  className={fieldClass}
                >
                  <option value="dominant">Dominant</option>
                  <option value="sekonder">Sekonder</option>
                  <option value="minör">Minör</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeFloraRow(i)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Flora Notları</label>
          <textarea
            value={form.floraNotes}
            onChange={(e) => setField("floraNotes", e.target.value)}
            rows={3}
            className={fieldClass}
            placeholder="Polen analizi hakkında ek açıklamalar..."
          />
        </div>
      </section>

      {/* Durum */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
            className="accent-honey-dark w-4 h-4"
          />
          <span className="text-sm text-gray-700">Aktif (müşteriler görebilir)</span>
        </label>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </div>
    </form>
  );
}

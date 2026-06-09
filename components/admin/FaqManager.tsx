"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export function FaqManager({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [saving, setSaving] = useState(false);

  async function addFaq() {
    if (!newQ.trim() || !newA.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQ, answer: newA, order: faqs.length + 1 }),
    });
    const faq = await res.json();
    setFaqs([...faqs, faq]);
    setNewQ("");
    setNewA("");
    setSaving(false);
  }

  async function deleteFaq(id: string) {
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    setFaqs(faqs.filter((f) => f.id !== id));
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setFaqs(faqs.map((f) => f.id === id ? { ...f, isActive } : f));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mevcut SSS */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-800">Mevcut SSS ({faqs.length})</h2>
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <GripVertical size={16} className="text-gray-300 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{faq.question}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Toggle
                  checked={faq.isActive}
                  onChange={(v) => toggleActive(faq.id, v)}
                  size="sm"
                />
                <button onClick={() => deleteFaq(faq.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Henüz SSS eklenmedi</p>}
      </div>

      {/* Yeni SSS ekle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4">Yeni Soru Ekle</h2>
        <div className="space-y-4">
          <Input label="Soru" value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Ürünleriniz katkısız mı?" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cevap</label>
            <textarea
              value={newA}
              onChange={(e) => setNewA(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
              placeholder="Evet, tüm ürünlerimiz..."
            />
          </div>
          <Button onClick={addFaq} loading={saving} className="w-full">
            <Plus size={16} /> SSS Ekle
          </Button>
        </div>
      </div>
    </div>
  );
}

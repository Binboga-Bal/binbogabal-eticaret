"use client";

import { useRef, useState } from "react";
import { Check, Images, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const POSITION_OPTIONS = [
  { value: 1, label: "1. Sıra", sublabel: "Ana görsel olur" },
  { value: 2, label: "2. Sıra", sublabel: "2. sıraya eklenir" },
  { value: 3, label: "3. Sıra", sublabel: "3. sıraya eklenir" },
];

type Tab = "add" | "manage";
type CommonImage = { url: string; count: number };

export function BulkImageModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("add");

  // — Add tab —
  const [addImageUrl, setAddImageUrl] = useState<string | null>(null);
  const [addUploading, setAddUploading] = useState(false);
  const [position, setPosition] = useState(1);
  const [applying, setApplying] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const addFileRef = useRef<HTMLInputElement>(null);

  // — Manage tab —
  const [commonImages, setCommonImages] = useState<CommonImage[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [newUploading, setNewUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [manageError, setManageError] = useState("");
  const [manageSuccess, setManageSuccess] = useState("");
  const editFileRef = useRef<HTMLInputElement>(null);

  async function loadList() {
    setLoadingList(true);
    setManageError("");
    const res = await fetch("/api/admin/products/bulk-image");
    const data = await res.json();
    setLoadingList(false);
    if (data.error) setManageError(data.error);
    else setCommonImages(data.images);
  }

  function switchTab(t: Tab) {
    setTab(t);
    setManageError("");
    setManageSuccess("");
    setEditingUrl(null);
    setNewImageUrl(null);
    setDeletingUrl(null);
    if (t === "manage") loadList();
  }

  function handleClose() {
    if (applying || saving) return;
    setOpen(false);
    setTab("add");
    setAddImageUrl(null);
    setPosition(1);
    setAddError("");
    setAddSuccess("");
    setCommonImages([]);
    setEditingUrl(null);
    setNewImageUrl(null);
    setDeletingUrl(null);
    setManageError("");
    setManageSuccess("");
  }

  // — Add tab handlers —

  async function handleAddUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddUploading(true);
    setAddError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "images/products");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setAddUploading(false);
    if (data.url) setAddImageUrl(data.url as string);
    else setAddError(data.error ?? "Görsel yüklenemedi.");
    e.target.value = "";
  }

  async function handleApply() {
    if (!addImageUrl) return;
    setApplying(true);
    setAddError("");
    setAddSuccess("");
    const res = await fetch("/api/admin/products/bulk-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: addImageUrl, position }),
    });
    const data = await res.json();
    setApplying(false);
    if (data.error) {
      setAddError(data.error);
    } else {
      const msg =
        data.adjusted > 0
          ? `${data.exact} ürüne ${position}. sıraya, ${data.adjusted} ürüne (görsel yetersiz) son sıraya eklendi.`
          : `Görsel ${data.exact} ürünün ${position}. sırasına eklendi.`;
      setAddSuccess(msg);
    }
  }

  // — Manage tab handlers —

  async function handleNewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewUploading(true);
    setManageError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "images/products");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setNewUploading(false);
    if (data.url) setNewImageUrl(data.url as string);
    else setManageError(data.error ?? "Görsel yüklenemedi.");
    e.target.value = "";
  }

  async function handleReplace(oldUrl: string) {
    if (!newImageUrl) return;
    setSaving(true);
    setManageError("");
    setManageSuccess("");
    const res = await fetch("/api/admin/products/bulk-image", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldUrl, newUrl: newImageUrl }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) {
      setManageError(data.error);
    } else {
      setManageSuccess(`${data.updated} üründe görsel güncellendi.`);
      setEditingUrl(null);
      setNewImageUrl(null);
      loadList();
    }
  }

  async function handleDelete(url: string) {
    setSaving(true);
    setManageError("");
    setManageSuccess("");
    const res = await fetch("/api/admin/products/bulk-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) {
      setManageError(data.error);
    } else {
      setManageSuccess(`Görsel ${data.removed} üründen kaldırıldı.`);
      setDeletingUrl(null);
      loadList();
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Images size={16} /> Ortak Görsel
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Ortak Görsel Yönetimi</h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={applying || saving}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(["add", "manage"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    tab === t
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "add" ? "Ekle" : "Yönet"}
                </button>
              ))}
            </div>

            {/* ——— ADD TAB ——— */}
            {tab === "add" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Seçilen görsel tüm ürünlerin belirtilen sıraya eklenir. En fazla 3 görsel barındırılabilir. Mevcut görseli yeterli olmayan ürünlerde son sıraya eklenir.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Görsel</label>
                  {addImageUrl ? (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={addImageUrl} alt="Ortak görsel" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setAddImageUrl(null); setAddSuccess(""); }}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => addFileRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-honey hover:text-honey transition-colors"
                    >
                      <Upload size={20} />
                      <span className="text-xs">
                        {addUploading ? "Yükleniyor..." : "Görsel seç"}
                      </span>
                    </div>
                  )}
                  <input
                    ref={addFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAddUpload}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ekleneceği Sıra
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {POSITION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPosition(opt.value)}
                        className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 text-center transition-colors ${
                          position === opt.value
                            ? "border-honey bg-honey/10 text-honey-dark"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-sm font-bold">{opt.label}</span>
                        <span className="text-[10px] mt-0.5 text-gray-400">{opt.sublabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {addError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{addError}</p>
                )}
                {addSuccess && (
                  <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2">{addSuccess}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    onClick={handleApply}
                    disabled={!addImageUrl || !!addSuccess}
                    loading={applying}
                    className="flex-1"
                  >
                    Tüm Ürünlere Uygula
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleClose} disabled={applying}>
                    Kapat
                  </Button>
                </div>
              </div>
            )}

            {/* ——— MANAGE TAB ——— */}
            {tab === "manage" && (
              <div className="space-y-3">
                {loadingList ? (
                  <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Yükleniyor...</span>
                  </div>
                ) : commonImages.length === 0 ? (
                  <p className="text-center py-10 text-sm text-gray-400">
                    Birden fazla üründe kullanılan ortak görsel bulunamadı.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {commonImages.map(({ url, count }) => (
                      <div key={url} className="border border-gray-100 rounded-xl p-3 space-y-3">

                        {/* Image row */}
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 truncate">{url.split("/").pop()}</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {count} üründe kullanılıyor
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              title="Değiştir"
                              onClick={() => {
                                setEditingUrl(editingUrl === url ? null : url);
                                setNewImageUrl(null);
                                setDeletingUrl(null);
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                editingUrl === url
                                  ? "bg-blue-100 text-blue-600"
                                  : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              title="Kaldır"
                              onClick={() => {
                                setDeletingUrl(deletingUrl === url ? null : url);
                                setEditingUrl(null);
                                setNewImageUrl(null);
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                deletingUrl === url
                                  ? "bg-red-100 text-red-600"
                                  : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                              }`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Replace panel */}
                        {editingUrl === url && (
                          <div className="border-t border-gray-100 pt-3 space-y-2">
                            <p className="text-xs font-medium text-gray-600">Yeni görsel seç:</p>
                            {newImageUrl ? (
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={newImageUrl} alt="Yeni görsel" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setNewImageUrl(null)}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={14} className="text-white" />
                                  </button>
                                </div>
                                <div className="flex gap-2 flex-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleReplace(url)}
                                    loading={saving}
                                    className="flex-1"
                                  >
                                    <Check size={14} /> Güncelle
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => { setEditingUrl(null); setNewImageUrl(null); }}
                                    disabled={saving}
                                  >
                                    İptal
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => editFileRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl h-14 flex items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-honey hover:text-honey transition-colors"
                              >
                                <Upload size={16} />
                                <span className="text-xs">
                                  {newUploading ? "Yükleniyor..." : "Görsel seç"}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delete confirmation panel */}
                        {deletingUrl === url && (
                          <div className="border-t border-gray-100 pt-3 space-y-3">
                            <p className="text-sm text-gray-700">
                              Bu görsel{" "}
                              <span className="font-semibold">{count} üründen</span> kaldırılacak.
                              Emin misiniz?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(url)}
                                loading={saving}
                                className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                              >
                                <Trash2 size={14} /> Kaldır
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeletingUrl(null)}
                                disabled={saving}
                              >
                                İptal
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Hidden file input for replace uploads */}
                <input
                  ref={editFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleNewUpload}
                />

                {manageError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{manageError}</p>
                )}
                {manageSuccess && (
                  <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2">{manageSuccess}</p>
                )}

                <Button type="button" variant="ghost" onClick={handleClose} className="w-full">
                  Kapat
                </Button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

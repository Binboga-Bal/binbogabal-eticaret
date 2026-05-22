"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Save, Trash2, Eye, Upload, X } from "lucide-react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

interface Props {
  post: Post | null;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BlogPostEditor({ post }: Props) {
  const router = useRouter();
  const isNew = !post;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    coverImage: post?.coverImage ?? "",
    isPublished: post?.isPublished ?? false,
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(val: string) {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === slugify(prev.title) || prev.slug === "" ? slugify(val) : prev.slug,
    }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "images/blog");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setField("coverImage", data.url);
      else setError(data.error ?? "Yükleme hatası");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${post!.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
      return;
    }

    setSuccess("Kaydedildi!");
    if (isNew && data.id) {
      router.replace(`/admin/icerik/blog/${data.id}`);
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) return;
    setDeleting(true);
    await fetch(`/api/admin/blog/${post!.id}`, { method: "DELETE" });
    router.push("/admin/icerik/blog");
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isNew ? "Yeni Blog Yazısı" : "Yazıyı Düzenle"}</h1>
          {!isNew && (
            <p className="text-sm text-gray-400 mt-0.5">
              Son güncelleme: {new Date(post!.updatedAt).toLocaleDateString("tr-TR")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <Link
                href={`/bal-rehberi/${post!.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-honey-dark border border-gray-200 rounded-lg px-3 py-2"
              >
                <Eye size={14} /> Önizle
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-50"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 size={14} /> Sil
              </Button>
            </>
          )}
          <Button type="submit" form="blog-form" loading={loading} size="sm">
            <Save size={14} /> Kaydet
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">{success}</div>}

      <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol kolon — içerik */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <Input
                label="Başlık *"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Blog yazısı başlığı"
              />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="otomatik-olusturulur"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Özet</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setField("excerpt", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey resize-none"
                  placeholder="Kısa bir özet yazın..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">İçerik *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setField("content", e.target.value)}
                  rows={20}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey resize-y font-mono"
                  placeholder="Yazı içeriğini buraya yazın. HTML veya Markdown kullanabilirsiniz..."
                />
                <p className="text-xs text-gray-400 mt-1">HTML desteklenir. Örnek: &lt;h2&gt;Başlık&lt;/h2&gt;, &lt;p&gt;Paragraf&lt;/p&gt;, &lt;strong&gt;Kalın&lt;/strong&gt;</p>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">SEO</h2>
              <Input
                label="Meta Başlık"
                value={form.metaTitle}
                onChange={(e) => setField("metaTitle", e.target.value)}
                placeholder="Boş bırakırsanız sayfa başlığı kullanılır"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Açıklama</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setField("metaDescription", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey resize-none"
                  placeholder="160 karaktere kadar açıklama"
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160</p>
              </div>
            </div>
          </div>

          {/* Sağ kolon — ayarlar */}
          <div className="space-y-5">
            {/* Yayınlama */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Yayın Durumu</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.isPublished}
                    onChange={(e) => setField("isPublished", e.target.checked)}
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.isPublished ? "bg-honey-dark" : "bg-gray-200"}`} />
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {form.isPublished ? "Yayında" : "Taslak"}
                </span>
              </label>
              {!isNew && post!.publishedAt && (
                <p className="text-xs text-gray-400">
                  Yayın tarihi: {new Date(post!.publishedAt).toLocaleDateString("tr-TR")}
                </p>
              )}
            </div>

            {/* Kapak görseli */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Kapak Görseli</h2>
              {form.coverImage ? (
                <div className="relative">
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.coverImage} alt="Kapak" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setField("coverImage", "")}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-honey hover:text-honey transition-colors"
                >
                  <Upload size={24} />
                  <span className="text-xs">{uploading ? "Yükleniyor..." : "Görsel yükle"}</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <Input
                label="veya URL girin"
                value={form.coverImage}
                onChange={(e) => setField("coverImage", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

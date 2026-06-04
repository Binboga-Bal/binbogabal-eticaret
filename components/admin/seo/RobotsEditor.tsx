"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";

export function RobotsEditor() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo/robots")
      .then((r) => r.json())
      .then((d) => d.content && setContent(d.content));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/robots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">robots.txt içeriği</span>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-50">
          <Save size={13} /> {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        placeholder="User-agent: *&#10;Disallow: /admin/"
        className="w-full p-4 font-mono text-xs text-gray-800 focus:outline-none resize-none"
      />
    </div>
  );
}

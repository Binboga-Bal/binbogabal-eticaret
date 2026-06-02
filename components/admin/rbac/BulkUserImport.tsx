"use client";

import { useState, useRef } from "react";

interface ImportResult {
  success: { name: string; email: string }[];
  errors: { row: number; email: string; error: string }[];
}

export function BulkUserImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFile(f: File) {
    if (!f.name.endsWith(".csv")) { alert("Sadece CSV dosyası yükleyin"); return; }
    setFile(f);
    setResult(null);
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/users/import", { method: "POST", body: fd });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">CSV Formatı</h3>
        <p className="text-sm text-blue-700 mb-2">Dosyanızın ilk satırı şu başlıkları içermeli:</p>
        <code className="text-xs bg-white border border-blue-200 rounded px-3 py-2 block font-mono">
          name,email,role_slug,department
        </code>
        <p className="text-xs text-blue-600 mt-2">Geçerli rol slug'ları: super_admin, admin, editor, accounting, shipping, support</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
          dragging ? "border-amber-400 bg-amber-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-600">{file ? file.name : "CSV dosyasını sürükleyin veya seçin"}</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>

      {file && !result && (
        <div className="flex justify-end gap-3">
          <button onClick={() => { setFile(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Temizle</button>
          <button onClick={upload} disabled={loading}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
            {loading ? "Yükleniyor..." : "Import Et"}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-700">{result.success.length}</div>
              <div className="text-sm text-green-600">Başarılı davet</div>
            </div>
            <div className={`border rounded-xl p-4 ${result.errors.length > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
              <div className={`text-2xl font-bold ${result.errors.length > 0 ? "text-red-700" : "text-gray-400"}`}>{result.errors.length}</div>
              <div className="text-sm text-gray-600">Hatalı satır</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b font-medium text-sm">Hatalar</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">Satır</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">Hata</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-500">{e.row}</td>
                      <td className="px-4 py-2">{e.email}</td>
                      <td className="px-4 py-2 text-red-600">{e.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={() => { setFile(null); setResult(null); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Yeni Import</button>
        </div>
      )}
    </div>
  );
}

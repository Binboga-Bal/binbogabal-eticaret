"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, FlaskConical, Leaf, Calendar, CheckCircle,
  AlertCircle, Loader2, Camera, X, CheckCheck,
} from "lucide-react";

type FloraItem = { name: string; percentage: number; type: "dominant" | "sekonder" | "minör" };

type Batch = {
  batchNumber: string;
  productName: string;
  productionDate: string;
  analysisDate: string;
  expiryDate: string;
  moistureContent: number | null;
  hmfValue: number | null;
  diastaseActivity: number | null;
  electricalConductivity: number | null;
  sucroseContent: number | null;
  ph: number | null;
  floraItems: FloraItem[];
  floraNotes: string | null;
  laboratoryName: string | null;
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

const FLORA_COLORS: Record<string, string> = {
  dominant: "bg-honey",
  sekonder: "bg-honey-dark",
  "minör": "bg-amber-300",
};

const FLORA_LABELS: Record<string, string> = {
  dominant: "Dominant",
  sekonder: "Sekonder",
  "minör": "Minör",
};

function QualityCard({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="bg-white rounded-2xl border border-honey-light p-4 text-center">
      <div className="text-2xl font-black text-honey-dark">
        {value != null ? value.toLocaleString("tr-TR") : "—"}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{unit}</div>
      <div className="text-sm font-semibold text-gray-700 mt-2">{label}</div>
    </div>
  );
}

// ─── Tarih yardımcıları ───────────────────────────────────────────────────────

/** Etiketteki DD/MM/YY → YYYY-MM-DD (input[type=date] değeri) */
function labelDateToIso(s: string): string | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!m) return null;
  const [, dd, mm, yy] = m;
  return `20${yy}-${mm}-${dd}`;
}

// ─── OCR ─────────────────────────────────────────────────────────────────────

function preprocessImageForOcr(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const scale = Math.max(1, 1200 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const v = gray > 160 ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("blob")), "image/png");
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

type OcrExtracted = {
  raw: string;
  batchNumber: string | null;
  /** YYYY-MM-DD — dolum tarihi (etiketteki ikinci DD/MM/YY) */
  dolumDate: string | null;
};

function extractFromOcr(text: string): OcrExtracted {
  // Tire normalize
  const normalized = text.replace(/[–—]/g, "-");

  // Parti numarası
  let batchNumber: string | null = null;
  const m1 = normalized.match(/\b(\d{2,6})-(\d{2,4})\b/);
  if (m1) {
    batchNumber = m1[0];
  } else {
    const m2 = normalized.match(/\b(\d{3,6})\s+(\d{2,3})\b/);
    if (m2) batchNumber = `${m2[1]}-${m2[2]}`;
    else {
      const m3 = normalized.match(/\b(\d{3,4})(\d{2})\b/);
      if (m3) batchNumber = `${m3[1]}-${m3[2]}`;
    }
  }

  // Etiket tarihleri: DD/MM/YY formatı — sıralama: TETT · Dolum · Parti No
  // Dolum = etiketteki ikinci tarih
  const dates = [...text.matchAll(/\b(\d{2})\/(\d{2})\/(\d{2})\b/g)];
  let dolumDate: string | null = null;
  if (dates.length >= 2) {
    dolumDate = labelDateToIso(dates[1][0]);
  } else if (dates.length === 1) {
    // Tek tarih bulunduysa hangisi olduğu belli değil — yine de göster
    dolumDate = labelDateToIso(dates[0][0]);
  }

  return { raw: text.trim(), batchNumber, dolumDate };
}

// ─── Component ───────────────────────────────────────────────────────────────

type OcrPanel = OcrExtracted | null;
type FetchState = "idle" | "loading" | "error" | "notfound" | "multiple";

export default function QrAnalizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [partiNo, setPartiNo] = useState(searchParams.get("parti") ?? "");
  const [dolumDate, setDolumDate] = useState(searchParams.get("dolum") ?? "");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrPanel, setOcrPanel] = useState<OcrPanel>(null);

  const search = useCallback(async (parti: string, dolum: string) => {
    if (!parti.trim()) return;
    setOcrPanel(null);
    setFetchState("loading");
    setBatch(null);
    setErrorMsg("");

    const url = new URL(`/api/batch/${encodeURIComponent(parti.trim())}`, window.location.origin);
    if (dolum) url.searchParams.set("dolum", dolum);

    try {
      const res = await fetch(url.toString());
      const data = await res.json();

      if (res.status === 404) { setFetchState("notfound"); return; }
      if (res.status === 409 && data.error === "multiple") {
        setFetchState("multiple");
        setErrorMsg(data.message);
        return;
      }
      if (!res.ok) { setErrorMsg(data.error ?? "Bir hata oluştu."); setFetchState("error"); return; }

      setBatch(data);
      setFetchState("idle");

      const params = new URLSearchParams({ parti: parti.trim() });
      if (dolum) params.set("dolum", dolum);
      router.replace(`/qr-analiz?${params.toString()}`, { scroll: false });
    } catch {
      setErrorMsg("Sunucuya ulaşılamadı.");
      setFetchState("error");
    }
  }, [router]);

  useEffect(() => {
    const parti = searchParams.get("parti");
    const dolum = searchParams.get("dolum") ?? "";
    if (parti) { setPartiNo(parti); setDolumDate(dolum); search(parti, dolum); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(partiNo, dolumDate);
  }

  async function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (cameraInputRef.current) cameraInputRef.current.value = "";

    setOcrLoading(true);
    setOcrPanel(null);

    try {
      const processed = await preprocessImageForOcr(file);
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("eng");
      const { data: { text } } = await worker.recognize(processed);
      await worker.terminate();

      const extracted = extractFromOcr(text);
      setOcrPanel(extracted);

      if (extracted.batchNumber) setPartiNo(extracted.batchNumber);
      if (extracted.dolumDate) setDolumDate(extracted.dolumDate);
    } catch {
      setOcrPanel({ raw: "", batchNumber: null, dolumDate: null });
    } finally {
      setOcrLoading(false);
    }
  }

  function applyOcrAndSearch() {
    if (!ocrPanel) return;
    const parti = ocrPanel.batchNumber ?? partiNo;
    const dolum = ocrPanel.dolumDate ?? dolumDate;
    if (ocrPanel.batchNumber) setPartiNo(parti);
    if (ocrPanel.dolumDate) setDolumDate(dolum);
    setOcrPanel(null);
    search(parti, dolum);
  }

  const isLoading = fetchState === "loading" || ocrLoading;
  const ocrFound = ocrPanel && (ocrPanel.batchNumber || ocrPanel.dolumDate);

  return (
    <div className="min-h-screen bg-honey-cream">
      {/* Hero */}
      <div className="bg-gradient-to-b from-honey to-honey-dark py-14 px-4 text-center">
        <div className="flex justify-center mb-3">
          <FlaskConical className="text-white w-10 h-10 opacity-90" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Bal Analiz Raporu</h1>
        <p className="text-honey-light text-sm max-w-sm mx-auto">
          Kavanoz etiketindeki Parti No ve Dolum Tarihini girerek ya da fotoğraf çekerek kalite raporunuza ulaşın.
        </p>
      </div>

      {/* Arama formu */}
      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Satır 1: Parti No + Kamera */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Parti No</label>
                <input
                  type="text"
                  value={partiNo}
                  onChange={(e) => { setPartiNo(e.target.value); setOcrPanel(null); }}
                  placeholder="141-01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey font-mono"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isLoading}
                  title="Etiketi kamerayla tara"
                  className="flex items-center justify-center w-12 h-[46px] rounded-xl border border-gray-200 text-gray-500 hover:bg-honey-cream hover:text-honey-dark hover:border-honey transition-colors disabled:opacity-50"
                >
                  {ocrLoading ? <Loader2 size={18} className="animate-spin text-honey" /> : <Camera size={18} />}
                </button>
              </div>
            </div>

            {/* Satır 2: Dolum Tarihi */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">
                Dolum Tarihi <span className="text-gray-400 font-normal">(etikette ikinci tarih)</span>
              </label>
              <input
                type="date"
                value={dolumDate}
                onChange={(e) => { setDolumDate(e.target.value); setOcrPanel(null); }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !partiNo.trim()}
              className="w-full flex items-center justify-center gap-2 bg-honey text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-honey-dark transition-colors disabled:opacity-60"
            >
              {fetchState === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Sorgula
            </button>
          </form>

          {/* OCR yükleniyor */}
          {ocrLoading && (
            <p className="text-xs text-honey-dark flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Fotoğraf işleniyor...
            </p>
          )}

          {/* OCR sonuç paneli */}
          {ocrPanel && (
            <div className={`rounded-xl border p-3 text-sm ${ocrFound ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
              {ocrFound ? (
                <div>
                  <p className="text-xs text-green-700 font-medium mb-2">Etiketten okunanlar</p>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {ocrPanel.batchNumber && (
                      <div>
                        <p className="text-xs text-gray-500">Parti No</p>
                        <p className="font-mono font-bold text-green-800">{ocrPanel.batchNumber}</p>
                      </div>
                    )}
                    {ocrPanel.dolumDate && (
                      <div>
                        <p className="text-xs text-gray-500">Dolum Tarihi</p>
                        <p className="font-bold text-green-800">
                          {new Date(ocrPanel.dolumDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={applyOcrAndSearch}
                      className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCheck size={13} />
                      Sorgula
                    </button>
                    <button onClick={() => setOcrPanel(null)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                      Kapat
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-orange-700 font-medium flex items-center gap-1.5">
                      <AlertCircle size={13} />
                      Otomatik tanınamadı — okunan metin:
                    </p>
                    <button onClick={() => setOcrPanel(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                  {ocrPanel.raw ? (
                    <p className="font-mono text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 whitespace-pre-wrap break-all leading-relaxed">
                      {ocrPanel.raw}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">Hiçbir metin okunamadı. Daha iyi aydınlatılmış ve yakın bir fotoğraf deneyin.</p>
                  )}
                  <p className="text-xs text-orange-600 mt-2">Yukarıdaki metinden bilgileri bulup alanları doldurun.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gizli kamera input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />

      {/* Sonuç */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {fetchState === "loading" && (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Loader2 size={32} className="animate-spin mx-auto mb-3 text-honey" />
            Rapor yükleniyor...
          </div>
        )}

        {fetchState === "notfound" && (
          <div className="bg-white rounded-2xl border border-red-100 p-6 flex gap-4 items-start">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={22} />
            <div>
              <p className="font-semibold text-gray-800">Parti bulunamadı</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-mono font-bold">{partiNo}</span>
                {dolumDate && <> · {new Date(dolumDate).toLocaleDateString("tr-TR")}</>} numaralı partiye ait kayıt bulunamadı.
                Lütfen etiketi kontrol ederek tekrar deneyin.
              </p>
            </div>
          </div>
        )}

        {fetchState === "multiple" && (
          <div className="bg-white rounded-2xl border border-amber-200 p-6 flex gap-4 items-start">
            <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={22} />
            <div>
              <p className="font-semibold text-gray-800">Dolum tarihini girin</p>
              <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {(fetchState === "error") && (
          <div className="bg-white rounded-2xl border border-red-100 p-6 flex gap-4 items-start">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={22} />
            <p className="text-sm text-gray-600">{errorMsg}</p>
          </div>
        )}

        {batch && (
          <>
            {/* Başlık kartı */}
            <div className="bg-white rounded-2xl border border-honey-light p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Parti Numarası</p>
                  <p className="font-mono text-2xl font-black text-honey-dark">{batch.batchNumber}</p>
                  <p className="text-gray-700 font-semibold mt-1">{batch.productName}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
                  <CheckCircle size={13} />
                  Doğrulandı
                </span>
              </div>
            </div>

            {/* TETT banner */}
            <div className="bg-honey-dark text-white rounded-2xl p-6 text-center">
              <p className="text-xs uppercase tracking-widest opacity-75 mb-2 font-medium">
                TETT — Tavsiye Edilen Tüketim Tarihi
              </p>
              <p className="text-4xl font-black">{fmt(batch.expiryDate)}</p>
              <p className="text-sm opacity-70 mt-2">Bu tarihten önce tüketilmesi önerilir</p>
            </div>

            {/* Tarih bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-honey-dark" />
                <h2 className="font-bold text-gray-800">Tarih Bilgileri</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Dolum Tarihi", value: batch.productionDate },
                  { label: "Analiz Tarihi", value: batch.analysisDate },
                  { label: "TETT", value: batch.expiryDate },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-honey-cream rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-bold text-gray-800 text-sm">{fmt(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kalite değerleri */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical size={18} className="text-honey-dark" />
                <h2 className="font-bold text-gray-800">Kalite Değerleri</h2>
                {batch.laboratoryName && (
                  <span className="ml-auto text-xs text-gray-400">{batch.laboratoryName}</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <QualityCard label="Nem Oranı" value={batch.moistureContent} unit="%" />
                <QualityCard label="HMF" value={batch.hmfValue} unit="mg/kg" />
                <QualityCard label="Diyastaz" value={batch.diastaseActivity} unit="DN" />
                <QualityCard label="El. İletkenlik" value={batch.electricalConductivity} unit="mS/cm" />
                <QualityCard label="Sakaroz" value={batch.sucroseContent} unit="%" />
                <QualityCard label="pH" value={batch.ph} unit="pH" />
              </div>
            </div>

            {/* Flora */}
            {(batch.floraItems.length > 0 || batch.floraNotes) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf size={18} className="text-green-600" />
                  <h2 className="font-bold text-gray-800">Flora / Polen Analizi</h2>
                </div>
                {batch.floraItems.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {batch.floraItems.map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {FLORA_LABELS[item.type] ?? item.type}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">%{item.percentage}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${FLORA_COLORS[item.type] ?? "bg-honey"}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {batch.floraNotes && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
                    {batch.floraNotes}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {fetchState === "idle" && !batch && !ocrLoading && (
          <div className="text-center py-8 text-sm text-gray-400 space-y-1">
            <p>Etiketteki <span className="font-mono font-semibold">141-01</span> gibi parti numarasını ve dolum tarihini girin.</p>
            <p className="flex items-center justify-center gap-1.5">
              <Camera size={14} />
              Ya da kamera butonuna tıklayarak etiketi okutun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

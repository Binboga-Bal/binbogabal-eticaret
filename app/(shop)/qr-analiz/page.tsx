"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, FlaskConical, Leaf, Calendar, CheckCircle,
  AlertCircle, Loader2, Camera, X,
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

// Batch numarası pattern: 159-06 gibi
function extractBatchNumber(text: string): string | null {
  const match = text.match(/\b\d{2,6}-\d{2,4}\b/);
  return match ? match[0] : null;
}

type OcrState = "idle" | "processing";

export default function QrAnalizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState(searchParams.get("parti") ?? "");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "error" | "notfound">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ocrState, setOcrState] = useState<OcrState>("idle");
  const [ocrError, setOcrError] = useState("");

  const search = useCallback(async (batchNumber: string) => {
    if (!batchNumber.trim()) return;
    setFetchState("loading");
    setBatch(null);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/batch/${encodeURIComponent(batchNumber.trim())}`);
      if (res.status === 404) { setFetchState("notfound"); return; }
      if (!res.ok) {
        setErrorMsg("Bir hata oluştu. Lütfen tekrar deneyin.");
        setFetchState("error");
        return;
      }
      const data = await res.json();
      setBatch(data);
      setFetchState("idle");
      router.replace(`/qr-analiz?parti=${encodeURIComponent(batchNumber.trim())}`, { scroll: false });
    } catch {
      setErrorMsg("Sunucuya ulaşılamadı.");
      setFetchState("error");
    }
  }, [router]);

  useEffect(() => {
    const parti = searchParams.get("parti");
    if (parti) { setInput(parti); search(parti); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(input);
  }

  async function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError("");
    setOcrState("processing");

    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("eng");
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const found = extractBatchNumber(text);
      if (found) {
        setInput(found);
        setOcrState("idle");
        search(found);
      } else {
        setOcrError("Parti numarası tanınamadı. Lütfen daha net bir fotoğraf çekin veya elle girin.");
        setOcrState("idle");
      }
    } catch {
      setOcrError("Kamera okuması başarısız oldu. Lütfen elle girin.");
      setOcrState("idle");
    } finally {
      // reset input so same image can be reselected
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  const isLoading = fetchState === "loading" || ocrState === "processing";

  return (
    <div className="min-h-screen bg-honey-cream">
      {/* Hero */}
      <div className="bg-gradient-to-b from-honey to-honey-dark py-14 px-4 text-center">
        <div className="flex justify-center mb-3">
          <FlaskConical className="text-white w-10 h-10 opacity-90" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Bal Analiz Raporu</h1>
        <p className="text-honey-light text-sm max-w-sm mx-auto">
          Kavanozunuzun üzerindeki parti numarasını girerek veya fotoğraf çekerek kalite raporunuza ulaşın.
        </p>
      </div>

      {/* Arama */}
      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Parti numaranızı girin (örn: 159-06)"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey font-mono"
              disabled={isLoading}
            />
            {/* Kamera butonu */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
              title="Kamerayla oku"
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-honey-cream hover:text-honey-dark hover:border-honey transition-colors disabled:opacity-50"
            >
              {ocrState === "processing" ? (
                <Loader2 size={18} className="animate-spin text-honey" />
              ) : (
                <Camera size={18} />
              )}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-honey text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-honey-dark transition-colors disabled:opacity-60"
            >
              {fetchState === "loading" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Sorgula
            </button>
          </form>

          {/* OCR durum/hata */}
          {ocrState === "processing" && (
            <p className="text-xs text-honey-dark mt-2 flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Fotoğraf okunuyor, lütfen bekleyin...
            </p>
          )}
          {ocrError && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
              <X size={13} className="flex-shrink-0 mt-0.5" />
              {ocrError}
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
                <span className="font-mono font-bold">{input}</span> numaralı partiye ait kayıt bulunamadı. Lütfen etiketi kontrol ederek tekrar deneyin.
              </p>
            </div>
          </div>
        )}

        {fetchState === "error" && (
          <div className="bg-white rounded-2xl border border-red-100 p-6 flex gap-4 items-start">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={22} />
            <p className="text-sm text-gray-600">{errorMsg}</p>
          </div>
        )}

        {batch && (
          <>
            {/* Doğrulandı başlık kartı */}
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

            {/* Öne çıkarılmış tüketim tarihi */}
            <div className="bg-honey-dark text-white rounded-2xl p-6 text-center">
              <p className="text-xs uppercase tracking-widest opacity-75 mb-2 font-medium">
                Tavsiye Edilen Tüketim Tarihi
              </p>
              <p className="text-4xl font-black">{fmt(batch.expiryDate)}</p>
              <p className="text-sm opacity-70 mt-2">
                Bu tarihten önce tüketilmesi önerilir
              </p>
            </div>

            {/* Tarih Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-honey-dark" />
                <h2 className="font-bold text-gray-800">Tarih Bilgileri</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Üretim Tarihi", value: batch.productionDate },
                  { label: "Analiz Tarihi", value: batch.analysisDate },
                  { label: "Tavsiye Edilen Tüketim", value: batch.expiryDate },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-honey-cream rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-bold text-gray-800 text-sm">{fmt(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kalite Değerleri */}
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

        {fetchState === "idle" && !batch && (
          <div className="text-center py-8 text-sm text-gray-400 space-y-1">
            <p>Kavanozunuzun üzerindeki <span className="font-mono font-semibold">159-06</span> gibi parti numarasını girin.</p>
            <p className="flex items-center justify-center gap-1.5">
              <Camera size={14} />
              Ya da kamera butonuna tıklayarak etiketi fotoğraflayın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

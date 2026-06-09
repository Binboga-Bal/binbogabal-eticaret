"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Loader2, MapPin, Phone, Mail, Clock } from "lucide-react";

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

interface Props {
  contactItems: ContactItem[];
  mapEmbedUrl?: string | null;
}

const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-honey focus:border-transparent transition";

export function ContactForm({ contactItems, mapEmbedUrl }: Props) {
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((p) => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Bir hata oluştu.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
      setStatus("error");
    }
  }

  return (
    <section className="py-8 lg:py-16 bg-white">
      <div className="w-full px-4 sm:px-10 lg:px-20 xl:px-32">
        <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <div className="grid lg:grid-cols-7 gap-0">

          {/* Sol — İletişim Bilgileri */}
          <div className="lg:col-span-2 bg-honey-dark p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Dekoratif daireler */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white mb-2">Bize Ulaşın</h2>
              <p className="text-white/60 text-sm mb-10 leading-relaxed">
                Sorularınız, önerileriniz veya sipariş bilgisi için her zaman yanınızdayız.
              </p>

              <div className="space-y-6">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-white hover:text-honey-bright transition-colors whitespace-pre-line"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-white/90 whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bal ikonu */}
            <div className="relative z-10 mt-10 pt-8 border-t border-white/10">
              <p className="text-white/40 text-xs">
                © {new Date().getFullYear()} S.S. 745 Sayılı Kozan Bal Tarım Satış Kooperatifi
              </p>
            </div>
          </div>

          {/* Sağ — Form + opsiyonel Harita */}
          <div className="lg:col-span-5 flex flex-col lg:flex-row bg-white min-h-0">

            {/* Form */}
            <div className="p-8 lg:p-10 lg:w-[520px] shrink-0">
              {status === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Mesajınız İletildi!</h3>
                  <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                    En kısa sürede size geri döneceğiz. İlginiz için teşekkür ederiz.
                  </p>
                  <button
                    onClick={() => { setStatus("idle"); setFields({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-6 text-sm font-semibold text-honey-dark hover:underline"
                  >
                    Yeni mesaj gönder
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Mesaj Gönderin</h2>
                  <p className="text-sm text-gray-400 mb-8">Tüm alanları doldurun, en kısa sürede yanıtlayalım.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Ad Soyad <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={fields.name}
                          onChange={set("name")}
                          className={inputCls}
                          placeholder="Adınız ve soyadınız"
                          required
                          disabled={status === "loading"}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          E-posta <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={fields.email}
                          onChange={set("email")}
                          className={inputCls}
                          placeholder="ornek@email.com"
                          required
                          disabled={status === "loading"}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Konu
                      </label>
                      <input
                        type="text"
                        value={fields.subject}
                        onChange={set("subject")}
                        className={inputCls}
                        placeholder="Mesajınızın konusu"
                        disabled={status === "loading"}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Mesajınız <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={fields.message}
                        onChange={set("message")}
                        className={`${inputCls} resize-none`}
                        placeholder="Mesajınızı buraya yazın..."
                        required
                        disabled={status === "loading"}
                      />
                    </div>

                    {status === "error" && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                        <AlertCircle size={16} className="shrink-0" />
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full flex items-center justify-center gap-2 bg-honey-dark hover:bg-honey-dark/90 disabled:opacity-60 text-white font-bold rounded-xl px-6 py-3.5 text-sm transition"
                    >
                      {status === "loading" ? (
                        <><Loader2 size={16} className="animate-spin" /> Gönderiliyor…</>
                      ) : (
                        <><Send size={16} /> Gönder</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Harita — formun sağında */}
            {mapEmbedUrl && (
              <div className="border-t lg:border-t-0 lg:border-l border-gray-100 h-64 lg:h-auto flex-1">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Binboğa Bal Konumu"
                />
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

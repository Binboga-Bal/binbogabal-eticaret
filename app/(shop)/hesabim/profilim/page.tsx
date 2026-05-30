"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


const schema = z.object({
  name: z.string().min(2, "En az 2 karakter"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilPage() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setError("");
    const res = await fetch("/api/customer/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) { setError("Bir hata oluştu"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Profilim</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad</label>
          <input {...register("name")} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
          <input {...register("phone")} placeholder="+90 5xx xxx xx xx" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600 font-semibold">Kaydedildi!</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}

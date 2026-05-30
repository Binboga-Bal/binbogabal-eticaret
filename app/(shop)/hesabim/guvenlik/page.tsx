"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1, "Zorunlu"),
  newPassword: z.string().min(8, "En az 8 karakter"),
  confirmPassword: z.string().min(1, "Zorunlu"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function GuvenlikPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setError(""); setSuccess("");
    const res = await fetch("/api/customer/me/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Bir hata oluştu");
      return;
    }
    setSuccess("Şifreniz başarıyla güncellendi");
    reset();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Güvenlik</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg space-y-4">
        <h2 className="font-bold text-gray-800">Şifre Değiştir</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "currentPassword" as const, label: "Mevcut Şifre" },
            { name: "newPassword" as const, label: "Yeni Şifre" },
            { name: "confirmPassword" as const, label: "Yeni Şifre (Tekrar)" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
              <input {...register(name)} type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey" />
              {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>}
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600 font-semibold">{success}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
            {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}

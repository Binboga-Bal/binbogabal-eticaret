"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  password: z.string().min(8, "En az 8 karakter"),
  confirm: z.string().min(1, "Zorunlu"),
}).refine((d) => d.password === d.confirm, { message: "Şifreler eşleşmiyor", path: ["confirm"] });

type FormValues = z.infer<typeof schema>;

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Bir hata oluştu");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/hesabim/giris"), 2000);
  }

  if (!token) return <p className="text-red-600 text-sm">Geçersiz bağlantı.</p>;

  if (success) return <p className="text-green-600 font-semibold text-sm">Şifreniz güncellendi! Giriş sayfasına yönlendiriliyorsunuz...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
      {[
        { name: "password" as const, label: "Yeni Şifre" },
        { name: "confirm" as const, label: "Yeni Şifre (Tekrar)" },
      ].map(({ name, label }) => (
        <div key={name}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
          <input {...register(name)} type="password"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey" />
          {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>}
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm">
        {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}

export default function SifreSifirlaPage() {
  return (
    <div className="max-w-md mx-auto px-4">
      <h1 className="text-2xl font-black text-gray-900 mb-2">Şifre Sıfırla</h1>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}

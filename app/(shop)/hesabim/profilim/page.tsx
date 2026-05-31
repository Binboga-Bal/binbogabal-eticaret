"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, X } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "En az 2 karakter"),
  phone: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin"),
});

type FormValues = z.infer<typeof schema>;

type UserData = {
  name: string | null;
  phone: string | null;
  email: string;
};

export default function ProfilPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((data: UserData) => {
        setUserData(data);
        reset({ name: data.name ?? "", phone: data.phone ?? "", email: data.email });
      });
  }, [reset]);

  async function onSubmit(data: FormValues) {
    setError("");
    const res = await fetch("/api/customer/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { setError("Bir hata oluştu"); return; }
    const updated: UserData = await res.json();
    setUserData(updated);
    reset({ name: updated.name ?? "", phone: updated.phone ?? "", email: updated.email });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    if (userData) {
      reset({ name: userData.name ?? "", phone: userData.phone ?? "", email: userData.email });
    }
    setEditing(false);
    setError("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Profilim</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 max-w-lg relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {editing ? (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <X size={14} />
              İptal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm text-honeyDark hover:text-honey border border-honeyDark/30 hover:border-honey rounded-lg px-3 py-1.5 transition-colors"
            >
              <Pencil size={14} />
              Düzenle
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad</label>
          {editing ? (
            <>
              <input
                {...register("name")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </>
          ) : (
            <p className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-xl">
              {userData?.name || <span className="text-gray-400">—</span>}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
          {editing ? (
            <>
              <input
                {...register("email")}
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </>
          ) : (
            <p className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-xl">
              {userData?.email || <span className="text-gray-400">—</span>}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
          {editing ? (
            <input
              {...register("phone")}
              placeholder="+90 5xx xxx xx xx"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey"
            />
          ) : (
            <p className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-xl">
              {userData?.phone || <span className="text-gray-400">—</span>}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600 font-semibold">Kaydedildi!</p>}

        {editing && (
          <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        )}
      </form>
    </div>
  );
}

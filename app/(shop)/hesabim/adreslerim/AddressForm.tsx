"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(1, "Zorunlu"),
  firstName: z.string().min(1, "Zorunlu"),
  lastName: z.string().min(1, "Zorunlu"),
  phone: z.string().min(10, "Geçerli telefon giriniz"),
  city: z.string().min(1, "Zorunlu"),
  district: z.string().min(1, "Zorunlu"),
  neighborhood: z.string().optional(),
  fullAddress: z.string().min(5, "Adres çok kısa"),
  zipCode: z.string().optional(),
  taxNumber: z.string().optional(),
  taxOffice: z.string().optional(),
  isDefault: z.boolean().optional(),
  isBilling: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  addressId?: string;
  defaultValues?: Partial<FormValues>;
}

export function AddressForm({ addressId, defaultValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const isEdit = !!addressId;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(data: FormValues) {
    setServerError("");
    const url = isEdit ? `/api/customer/addresses/${addressId}` : "/api/customer/addresses";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) { setServerError("Bir hata oluştu"); return; }
    router.push("/hesabim/adreslerim");
    router.refresh();
  }

  const field = (name: keyof FormValues, label: string, placeholder?: string) => {
    const err = errors[name];
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
        <input {...register(name)} placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey" />
        {err && typeof err.message === "string" && <p className="text-xs text-red-500 mt-1">{err.message}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 max-w-2xl">
      {field("title", "Adres Başlığı", "Ev, İş...")}
      <div className="grid grid-cols-2 gap-4">
        {field("firstName", "Ad")}
        {field("lastName", "Soyad")}
      </div>
      {field("phone", "Telefon", "+90 5xx xxx xx xx")}
      <div className="grid grid-cols-2 gap-4">
        {field("city", "İl")}
        {field("district", "İlçe")}
      </div>
      {field("neighborhood", "Mahalle")}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Açık Adres</label>
        <textarea {...register("fullAddress")} rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-honey resize-none" />
        {errors.fullAddress && <p className="text-xs text-red-500 mt-1">{errors.fullAddress.message}</p>}
      </div>
      {field("zipCode", "Posta Kodu")}

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Fatura Bilgileri (opsiyonel)</p>
        {field("taxNumber", "Vergi Numarası")}
        {field("taxOffice", "Vergi Dairesi")}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" {...register("isDefault")} className="rounded" /> Varsayılan adresim
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" {...register("isBilling")} className="rounded" /> Fatura adresi
        </label>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
          {isSubmitting ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          İptal
        </button>
      </div>
    </form>
  );
}

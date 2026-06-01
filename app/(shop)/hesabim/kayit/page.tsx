export const dynamic = "force-dynamic";
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
    kvkkConsent: false, newsletterConsent: false, smsConsent: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.kvkkConsent) { setError("KVKK onayı zorunludur"); return; }
    if (form.password !== form.confirm) { setError("Şifreler eşleşmiyor"); return; }
    if (form.password.length < 8) { setError("Şifre en az 8 karakter olmalı"); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        kvkkConsent: form.kvkkConsent,
        newsletterConsent: form.newsletterConsent,
        smsConsent: form.smsConsent,
      }),
    });

    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    window.location.href = "/hesabim";
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">Üye Ol</h1>
        <p className="text-sm text-gray-500 mt-2">Ücretsiz hesap oluşturun</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="E-posta" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Telefon" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Şifre" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Input label="Şifre Tekrar" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />

            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.kvkkConsent} onChange={(e) => setForm({ ...form, kvkkConsent: e.target.checked })}
                  className="mt-0.5 rounded" required />
                <span className="text-xs text-gray-600">
                  <Link href="/kvkk" className="underline font-semibold">KVKK Aydınlatma Metni</Link>&apos;ni okudum ve kabul ediyorum. (Zorunlu)
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.newsletterConsent} onChange={(e) => setForm({ ...form, newsletterConsent: e.target.checked })}
                  className="mt-0.5 rounded" />
                <span className="text-xs text-gray-600">Kampanya ve yeniliklerden e-posta ile haberdar olmak istiyorum.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.smsConsent} onChange={(e) => setForm({ ...form, smsConsent: e.target.checked })}
                  className="mt-0.5 rounded" />
                <span className="text-xs text-gray-600">SMS bildirimleri almak istiyorum.</span>
              </label>
            </div>

            {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

            <Button type="submit" loading={loading} className="w-full" size="lg">Üye Ol</Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Hesabınız var mı?{" "}
            <Link href="/hesabim/giris" className="text-honey-dark font-semibold hover:underline">Giriş yapın</Link>
          </div>
          <div className="mt-2 text-center">
            <Link href="/hesabim/sifremi-unuttum" className="text-xs text-gray-400 hover:text-honey-dark">Şifremi unuttum</Link>
          </div>
      </div>
    </div>
  );
}

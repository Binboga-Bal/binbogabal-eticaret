"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/hesabim";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-posta veya şifre hatalı");
      setLoading(false);
      return;
    }

    router.push(from);
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">Hesabıma Giriş</h1>
          <p className="text-sm text-gray-500 mt-2">Binboğa Kooperatif Balı hesabınıza giriş yapın</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Şifre"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Giriş Yap
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Hesabınız yok mu?{" "}
            <Link href="/hesabim/kayit" className="text-honey-dark font-semibold hover:underline">
              Ücretsiz kayıt olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

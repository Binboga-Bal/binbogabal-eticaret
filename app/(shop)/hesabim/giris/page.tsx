import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Giriş Yap | Binboğa Bal" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="text-gray-400">Yükleniyor...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}

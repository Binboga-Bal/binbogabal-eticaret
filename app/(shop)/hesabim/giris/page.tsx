import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Giriş Yap | Binboğa Bal" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="pt-16 text-center text-gray-400">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}

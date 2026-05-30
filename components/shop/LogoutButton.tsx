"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors w-full text-left"
      >
        <LogOut size={16} />
        Çıkış Yap
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <LogOut size={22} className="text-red-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Çıkış yapmak istiyor musunuz?
              </h2>
              <p className="text-sm text-gray-500">
                Oturumunuz kapatılacak. Tekrar giriş yapabilirsiniz.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-sm text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Çıkılıyor…" : "Çıkış Yap"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

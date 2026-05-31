"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import type { User as NextAuthUser } from "next-auth";

interface AdminHeaderProps {
  user: NextAuthUser & { role?: string };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-slate-400">
        Hoş geldiniz, <span className="font-semibold text-white">{user.name ?? user.email}</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 text-sm text-white">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={16} className="text-slate-300" />
          </div>
          <span className="hidden md:block font-medium text-slate-200">{user.email}</span>
          <span className="text-xs text-slate-300 bg-slate-700 px-2 py-0.5 rounded font-medium">{user.role}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          title="Çıkış Yap"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

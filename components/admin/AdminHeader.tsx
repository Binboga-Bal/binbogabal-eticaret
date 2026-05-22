"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import type { User as NextAuthUser } from "next-auth";

interface AdminHeaderProps {
  user: NextAuthUser & { role?: string };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Hoş geldiniz, <span className="font-semibold text-gray-800">{user.name ?? user.email}</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-8 h-8 rounded-full bg-honey-light flex items-center justify-center">
            <User size={16} className="text-honey-dark" />
          </div>
          <span className="hidden md:block font-medium">{user.email}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{user.role}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
          title="Çıkış Yap"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

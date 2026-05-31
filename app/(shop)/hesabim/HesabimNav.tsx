"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, Tag, Star, Bell, ShieldCheck, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  { href: "/hesabim", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/hesabim/profilim", label: "Profilim", icon: User },
  { href: "/hesabim/siparislerim", label: "Siparişlerim", icon: Package },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPin },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: Heart },
  { href: "/hesabim/kuponlarim", label: "Kuponlarım", icon: Tag },
  { href: "/hesabim/yorumlarim", label: "Yorumlarım", icon: Star },
  { href: "/hesabim/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/hesabim/guvenlik", label: "Güvenlik", icon: ShieldCheck },
];

export function HesabimNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/hesabim"
            ? pathname === "/hesabim"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
              isActive
                ? "bg-honey/10 text-honeyDark font-semibold"
                : "text-gray-600 hover:bg-honey/10 hover:text-honeyDark"
            }`}
          >
            <item.icon size={16} className={isActive ? "text-honeyDark" : ""} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

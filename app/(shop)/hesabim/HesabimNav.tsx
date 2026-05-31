"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Heart,
  Tag,
  Star,
  Bell,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

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

interface HesabimNavProps {
  /** Mobil yatay scroll tab görünümü */
  mobile?: boolean;
}

export function HesabimNav({ mobile }: HesabimNavProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex gap-2 pb-1" style={{ minWidth: "max-content" }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/hesabim"
              ? pathname === "/hesabim"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-honey-dark text-white"
                  : "text-gray-600 bg-gray-100 hover:bg-honey-light/60 hover:text-honey-dark"
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/hesabim"
            ? pathname === "/hesabim"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors w-full ${
              isActive
                ? "bg-honey/10 text-honey-dark font-semibold"
                : "text-gray-600 hover:bg-honey/10 hover:text-honey-dark"
            }`}
          >
            <item.icon
              size={16}
              className={isActive ? "text-honey-dark" : ""}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

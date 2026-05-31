"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Percent,
  FileText,
  HelpCircle,
  RefreshCw,
  Settings,
  ChevronDown,
  Layers,
  Image,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string }[];
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/urunler", label: "Ürünler", icon: <Package size={18} /> },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: <Layers size={18} /> },
  { href: "/admin/siparisler", label: "Siparişler", icon: <ShoppingBag size={18} /> },
  { href: "/admin/musteriler", label: "Müşteriler", icon: <Users size={18} />, roles: ["ADMIN", "SUPERADMIN"] },
  {
    href: "/admin/kampanyalar",
    label: "Kampanyalar",
    icon: <Percent size={18} />,
    children: [
      { href: "/admin/kampanyalar", label: "Tüm Kampanyalar" },
      { href: "/admin/kampanyalar/new", label: "Yeni Kampanya" },
      { href: "/admin/kampanyalar/calendar", label: "Takvim" },
      { href: "/admin/kampanyalar/coupons", label: "Kuponlar" },
      { href: "/admin/kampanyalar/reports", label: "Raporlar" },
    ],
  },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: <Star size={18} /> },
  {
    href: "/admin/icerik",
    label: "İçerik",
    icon: <FileText size={18} />,
    children: [
      { href: "/admin/icerik/blog", label: "Blog Yazıları" },
      { href: "/admin/icerik/faq", label: "SSS" },
    ],
  },
  { href: "/admin/bannerlar", label: "Görsel Yönetimi", icon: <Image size={18} />, roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/erp-sync", label: "ERP Senkron.", icon: <RefreshCw size={18} />, roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: <Settings size={18} />, roles: ["ADMIN", "SUPERADMIN"] },
];

interface AdminSidebarProps {
  role: string;
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-honey-dark font-black text-base">KOOPERATİF BALI</div>
        <div className="text-xs text-gray-400 mt-0.5">Admin Paneli</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expanded === item.href;

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.href)}
                  className={cn(
                    "admin-nav-link w-full",
                    isActive && "active"
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform", isExpanded && "rotate-180")}
                  />
                </button>
              ) : (
                <Link href={item.href} className={cn("admin-nav-link", isActive && "active")}>
                  {item.icon}
                  {item.label}
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "admin-nav-link text-xs",
                        pathname === child.href && "active"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t text-xs text-gray-400">
        v1.0.0 — Binboğa Bal
      </div>
    </aside>
  );
}

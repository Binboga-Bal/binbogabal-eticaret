"use client";

import Link from "next/link";
import NextImage from "next/image";
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
  Shield,
  ScrollText,
  UserCog,
  Search,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string }[];
  /** module:action — kullanıcı bu izne sahip değilse item gizlenir. Belirtilmezse herkes görür. */
  permission?: string;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, permission: "dashboard:view" },
  { href: "/admin/urunler", label: "Ürünler", icon: <Package size={18} />, permission: "products:view" },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: <Layers size={18} />, permission: "categories:view" },
  { href: "/admin/siparisler", label: "Siparişler", icon: <ShoppingBag size={18} />, permission: "orders:view" },
  { href: "/admin/musteriler", label: "Müşteriler", icon: <Users size={18} />, permission: "customers:view" },
  {
    href: "/admin/kampanyalar",
    label: "Kampanyalar",
    icon: <Percent size={18} />,
    permission: "campaigns:view",
    children: [
      { href: "/admin/kampanyalar", label: "Tüm Kampanyalar" },
      { href: "/admin/kampanyalar/new", label: "Yeni Kampanya" },
      { href: "/admin/kampanyalar/calendar", label: "Takvim" },
      { href: "/admin/kampanyalar/coupons", label: "Kuponlar" },
      { href: "/admin/kampanyalar/reports", label: "Raporlar" },
      { href: "/admin/hacim-indirimleri", label: "Hacim İndirimleri" },
    ],
  },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: <Star size={18} />, permission: "content:view" },
  {
    href: "/admin/icerik",
    label: "İçerik",
    icon: <FileText size={18} />,
    permission: "content:view",
    children: [
      { href: "/admin/icerik/blog", label: "Blog Yazıları" },
      { href: "/admin/icerik/faq", label: "SSS" },
    ],
  },
  { href: "/admin/bannerlar", label: "Görsel Yönetimi", icon: <Image size={18} />, permission: "media:view" },
  {
    href: "/admin/seo",
    label: "SEO & GEO",
    icon: <Search size={18} />,
    permission: "seo:view",
    children: [
      { href: "/admin/seo", label: "Dashboard" },
      { href: "/admin/seo/meta", label: "Meta Yönetimi" },
      { href: "/admin/seo/generative", label: "Generative SEO" },
      { href: "/admin/seo/generative/llms-txt", label: "llms.txt" },
      { href: "/admin/seo/generative/bot-access", label: "Bot Erişim Logu" },
      { href: "/admin/seo/ai/jobs", label: "AI İş Kuyruğu" },
      { href: "/admin/seo/templates", label: "SEO Şablonları" },
      { href: "/admin/seo/keywords", label: "Anahtar Kelimeler" },
      { href: "/admin/seo/redirects", label: "Yönlendirmeler" },
      { href: "/admin/seo/technical/robots", label: "Robots.txt" },
      { href: "/admin/seo/technical/sitemap", label: "Sitemap" },
      { href: "/admin/seo/reports", label: "Raporlar" },
    ],
  },
  { href: "/admin/erp-sync", label: "ERP Senkron.", icon: <RefreshCw size={18} />, permission: "erp:view" },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: <Settings size={18} />, permission: "settings:view" },
  {
    href: "/admin/users",
    label: "Admin Kullanıcılar",
    icon: <UserCog size={18} />,
    permission: "admin_users:view",
    children: [
      { href: "/admin/users", label: "Kullanıcı Listesi" },
      { href: "/admin/users/invite", label: "Davet Et" },
      { href: "/admin/users/import", label: "CSV Import" },
    ],
  },
  {
    href: "/admin/roles",
    label: "Rol Yönetimi",
    icon: <Shield size={18} />,
    permission: "roles:view",
    children: [
      { href: "/admin/roles", label: "Roller" },
      { href: "/admin/permissions/matrix", label: "İzin Matrisi" },
    ],
  },
  {
    href: "/admin/audit-log",
    label: "Audit Log",
    icon: <ScrollText size={18} />,
    permission: "audit_log:view",
    children: [
      { href: "/admin/audit-log", label: "Tüm Loglar" },
      { href: "/admin/audit-log/risk-alerts", label: "Risk Uyarıları" },
    ],
  },
  {
    href: "/admin/logs",
    label: "Aktivite Logları",
    icon: <Activity size={18} />,
    permission: "logs:view",
    children: [
      { href: "/admin/logs", label: "Log Listesi" },
      { href: "/admin/logs/stats", label: "İstatistikler" },
      { href: "/admin/logs/telegram", label: "Telegram Alertler" },
    ],
  },
  { href: "/admin/security", label: "Güvenlik", icon: <Shield size={18} />, permission: "roles:view" },
];

interface AdminSidebarProps {
  isSuperAdmin: boolean;
  grants: Set<string>;
  logoUrl?: string | null;
}

function hasPermission(isSuperAdmin: boolean, grants: Set<string>, permission: string): boolean {
  if (isSuperAdmin) return true;
  const [module, action] = permission.split(":");
  // grants içinde "module:action:" veya "module:action" formatı olabilir
  return grants.has(`${module}:${action}:`) || grants.has(`${module}:${action}`);
}

export function AdminSidebar({ isSuperAdmin, grants, logoUrl }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(isSuperAdmin, grants, item.permission);
  });

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col items-center">
        <NextImage
          src={logoUrl ?? "/images/logo.png"}
          alt="Binboğa Kooperatif Balı"
          width={140}
          height={48}
          className="object-contain"
          priority
          unoptimized={!!logoUrl}
        />
        <div className="text-xs font-semibold text-gray-500 tracking-wide mt-1.5">
          Admin Paneli
        </div>
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
                    "admin-nav-link w-full justify-start",
                    isActive && "active",
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn("admin-nav-link", isActive && "active")}
                >
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
                        pathname === child.href && "active",
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

export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils/format";
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react";
import { DashboardDateFilter } from "@/components/admin/DashboardDateFilter";

export const metadata = { title: "Admin Dashboard" };

type Preset = "today" | "7d" | "30d" | "month" | "all";

const VALID_PRESETS: Preset[] = ["today", "7d", "30d", "month"];

const PRESET_LABELS: Record<Preset, string> = {
  today: "Bugün",
  "7d": "Son 7 Gün",
  "30d": "Son 30 Gün",
  month: "Bu Ay",
  all: "Tüm Zamanlar",
};

function getDateRange(preset: Preset): { gte?: Date; lte?: Date } {
  const now = new Date();
  if (preset === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: now };
  }
  if (preset === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { gte: start, lte: now };
  }
  if (preset === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { gte: start, lte: now };
  }
  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { gte: start, lte: now };
  }
  return {};
}

async function getDashboardStats(preset: Preset) {
  const range = getDateRange(preset);
  const dateFilter = range.gte ? { createdAt: range } : undefined;

  const [
    totalOrders,
    totalRevenue,
    totalCustomers,
    totalProducts,
    recentOrders,
    pendingOrders,
  ] = await Promise.all([
    prisma.order.count({ where: dateFilter }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", ...(dateFilter ?? {}) },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER", ...(dateFilter ?? {}) } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
    prisma.order.count({ where: { status: "PENDING", ...(dateFilter ?? {}) } }),
  ]);

  return { totalOrders, totalRevenue, totalCustomers, totalProducts, recentOrders, pendingOrders };
}

interface PageProps {
  searchParams: Promise<{ preset?: string }>;
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  await requirePermission("dashboard", "view");

  const sp = await searchParams;
  const preset: Preset = VALID_PRESETS.includes(sp.preset as Preset)
    ? (sp.preset as Preset)
    : "all";

  const stats = await getDashboardStats(preset);
  const periodLabel = PRESET_LABELS[preset];

  const cards = [
    {
      title: "Sipariş",
      value: stats.totalOrders.toString(),
      icon: <ShoppingBag size={24} />,
      bg: "bg-blue-50 text-blue-600",
      note: `${stats.pendingOrders} bekleyen`,
    },
    {
      title: "Gelir",
      value: formatPrice(Number(stats.totalRevenue._sum.total ?? 0)),
      icon: <TrendingUp size={24} />,
      bg: "bg-green-50 text-green-600",
      note: "Ödenen siparişler",
    },
    {
      title: preset === "all" ? "Toplam Müşteri" : "Yeni Kayıt",
      value: stats.totalCustomers.toString(),
      icon: <Users size={24} />,
      bg: "bg-purple-50 text-purple-600",
      note: "Kayıtlı kullanıcı",
    },
    {
      title: "Aktif Ürün",
      value: stats.totalProducts.toString(),
      icon: <Package size={24} />,
      bg: "bg-orange-50 text-orange-600",
      note: "Toplam yayında",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <DashboardDateFilter active={preset} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">
                {card.title === "Aktif Ürün" ? card.title : `${periodLabel} ${card.title}`}
              </p>
              <div className={`p-2 rounded-xl ${card.bg}`}>{card.icon}</div>
            </div>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.note}</p>
          </div>
        ))}
      </div>

      {/* Son siparişler */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <h2 className="font-bold text-gray-800">Son Siparişler</h2>
          {preset !== "all" && (
            <span className="text-xs text-gray-400 font-normal bg-gray-100 px-2 py-0.5 rounded-full">
              {periodLabel}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sipariş No</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ürün Sayısı</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tutar</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-honey-dark">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">{order.items.length} ürün</td>
                  <td className="px-5 py-3 text-sm font-bold">{formatPrice(Number(order.total))}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    Bu dönemde sipariş yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Bekliyor", cls: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Onaylandı", cls: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "Hazırlanıyor", cls: "bg-orange-100 text-orange-700" },
    SHIPPED: { label: "Kargoda", cls: "bg-purple-100 text-purple-700" },
    DELIVERED: { label: "Teslim Edildi", cls: "bg-green-100 text-green-700" },
    CANCELLED: { label: "İptal", cls: "bg-red-100 text-red-700" },
    REFUNDED: { label: "İade", cls: "bg-gray-100 text-gray-700" },
  };

  const badge = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}>
      {badge.label}
    </span>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { LogOut, Package, User, MapPin } from "lucide-react";

export const metadata = { title: "Hesabım" };

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const STATUS_LABELS: Record<string, string> = {
    PENDING: "Bekliyor", CONFIRMED: "Onaylandı", PROCESSING: "Hazırlanıyor",
    SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal",
  };
  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Hesabım</h1>
          <p className="text-sm text-gray-500 mt-1">{session.user.email}</p>
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} /> Çıkış
        </Link>
      </div>

      {/* Hızlı linkler */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Package size={20} />, label: "Siparişlerim", count: orders.length, href: "#siparisler" },
          { icon: <User size={20} />, label: "Profil", count: null, href: "#profil" },
          { icon: <MapPin size={20} />, label: "Adreslerim", count: null, href: "#adresler" },
        ].map((item) => (
          <a key={item.label} href={item.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-2 hover:border-honey-dark transition-colors text-center card-hover"
          >
            <div className="text-honey-dark">{item.icon}</div>
            <p className="text-sm font-semibold text-gray-800">{item.label}</p>
            {item.count !== null && (
              <span className="text-xs text-gray-400">{item.count} adet</span>
            )}
          </a>
        ))}
      </div>

      {/* Siparişler */}
      <div id="siparisler">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Siparişlerim</h2>
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p>Henüz siparişiniz yok</p>
            <Link href="/urunlerimiz" className="btn-primary inline-flex mt-4 text-sm">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-honey-dark">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items.length} ürün</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{formatPrice(Number(order.total))}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
                {order.status === "SHIPPED" && (
                  <div className="mt-3 text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                    🚚 Paketiniz kargoya verildi
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

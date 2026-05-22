import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Müşteriler | Admin" };

interface PageProps {
  searchParams: Promise<{ sayfa?: string; ara?: string }>;
}

const PAGE_SIZE = 25;

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.sayfa ?? "1");
  const search = params.ara?.trim();

  const where = {
    role: "CUSTOMER" as const,
    ...(search ? {
      OR: [
        { email: { contains: search } },
        { name: { contains: search } },
      ],
    } : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, createdAt: true, isActive: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Müşteriler</h1>
        <p className="text-sm text-gray-500">{total} müşteri</p>
      </div>

      {/* Arama */}
      <form method="GET" className="flex gap-3 max-w-sm">
        <input
          name="ara"
          defaultValue={search}
          placeholder="İsim veya e-posta ara..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey"
        />
        <button type="submit" className="btn-primary text-sm px-4 py-2">Ara</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Müşteri", "Telefon", "Sipariş", "Kayıt Tarihi", "Durum"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="text-sm font-semibold text-gray-800">{c.name ?? "-"}</p>
                  <p className="text-xs text-gray-400">{c.email}</p>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{c.phone ?? "-"}</td>
                <td className="px-5 py-3 text-sm text-gray-700 font-medium">{c._count.orders} sipariş</td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{c.isActive ? "Aktif" : "Pasif"}</span>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">Müşteri bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

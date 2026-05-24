import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Ürün Yönetimi | Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      variants: { where: { isActive: true }, orderBy: { size: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Ürünler</h1>
        <Link href="/admin/urunler/yeni">
          <Button size="sm" className="gap-2">
            <Plus size={16} /> Yeni Ürün
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ürün</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Varyantlar</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fiyat (min)</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stok</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const raw = product.images;
                const images: string[] = Array.isArray(raw)
                  ? (raw as string[])
                  : typeof raw === "string"
                  ? (() => { try { return JSON.parse(raw); } catch { return []; } })()
                  : [];
                const minPrice = product.variants.length
                  ? Math.min(...product.variants.map((v) => parseFloat(v.discountedPrice?.toString() ?? v.price.toString())))
                  : 0;
                const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {images[0] && (
                            <Image src={images[0]} alt={product.name} fill className="object-contain" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{product.category?.name ?? "-"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{product.variants.length}</td>
                    <td className="px-5 py-3 text-sm font-bold text-honey-dark">
                      {minPrice > 0 ? formatPrice(minPrice) : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          totalStock === 0 ? "text-red-600" : totalStock < 10 ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {totalStock} adet
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/urunler/${product.id}`}
                          className="p-1.5 text-gray-500 hover:text-honey-dark transition-colors"
                        >
                          <Edit size={15} />
                        </Link>
                        <Link
                          href={`/urunlerimiz/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

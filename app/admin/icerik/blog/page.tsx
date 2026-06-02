export const dynamic = "force-dynamic";
import { requirePermission } from "@/lib/rbac/guards";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils/format";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Blog Yönetimi | Admin" };

export default async function AdminBlogPage() {
  await requirePermission("content", "view");
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Blog Yazıları</h1>
        <Link href="/admin/icerik/blog/yeni">
          <Button size="sm"><Plus size={16} /> Yeni Yazı</Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Başlık", "Durum", "Tarih", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="text-sm font-semibold text-gray-800">{post.title}</p>
                  <p className="text-xs text-gray-400">{post.slug}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    post.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>{post.isPublished ? "Yayında" : "Taslak"}</span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/icerik/blog/${post.id}`} className="p-1.5 text-gray-500 hover:text-honey-dark inline-block">
                    <Edit size={15} />
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">Henüz blog yazısı yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

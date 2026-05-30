import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { DeleteAddressButton } from "./DeleteAddressButton";

export const metadata = { title: "Adreslerim" };

export default async function AdreslerimPage() {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Adreslerim</h1>
        <Link href="/hesabim/adreslerim/yeni" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Yeni Adres
        </Link>
      </div>
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Henüz kayıtlı adresiniz yok</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white rounded-2xl border p-5 ${addr.isDefault ? "border-honey" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="font-bold text-gray-800">{addr.title}</p>
                {addr.isDefault && <span className="text-xs bg-honey-light text-honey-dark font-semibold px-2 py-0.5 rounded-full">Varsayılan</span>}
              </div>
              <p className="text-sm text-gray-600">{addr.firstName} {addr.lastName}</p>
              <p className="text-sm text-gray-600">{addr.fullAddress}</p>
              <p className="text-sm text-gray-600">{addr.district}, {addr.city}</p>
              <p className="text-sm text-gray-500">{addr.phone}</p>
              <div className="flex gap-3 mt-4">
                <Link href={`/hesabim/adreslerim/${addr.id}/duzenle`} className="text-xs text-honey-dark font-semibold hover:underline">Düzenle</Link>
                <DeleteAddressButton addressId={addr.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

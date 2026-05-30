import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressForm } from "../../AddressForm";

export const metadata = { title: "Adresi Düzenle" };

export default async function AdresDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/hesabim/giris");

  const { id } = await params;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== session.user.id) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Adresi Düzenle</h1>
      <AddressForm addressId={id} defaultValues={{
        title: address.title,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        city: address.city,
        district: address.district,
        neighborhood: address.neighborhood ?? undefined,
        fullAddress: address.fullAddress,
        zipCode: address.zipCode ?? undefined,
        taxNumber: address.taxNumber ?? undefined,
        taxOffice: address.taxOffice ?? undefined,
        isDefault: address.isDefault,
        isBilling: address.isBilling,
      }} />
    </div>
  );
}

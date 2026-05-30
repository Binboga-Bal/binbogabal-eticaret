import { AddressForm } from "../AddressForm";

export const metadata = { title: "Yeni Adres" };

export default function YeniAdresPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Yeni Adres Ekle</h1>
      <AddressForm />
    </div>
  );
}

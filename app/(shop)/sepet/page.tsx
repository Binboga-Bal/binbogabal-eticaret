import type { Metadata } from "next";
import { CartPageClient } from "@/components/shop/cart/CartPageClient";

export const metadata: Metadata = { title: "Sepetim" };

export default function CartPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Alışveriş Sepeti</h1>
      <CartPageClient />
    </div>
  );
}

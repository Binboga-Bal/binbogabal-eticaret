import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout/CheckoutForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const codSetting = await prisma.siteSetting.findUnique({
    where: { key: "cash_on_delivery_enabled" },
  });
  const codEnabled = codSetting?.value === "true";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Ödeme</h1>
      <CheckoutForm codEnabled={codEnabled} />
    </div>
  );
}

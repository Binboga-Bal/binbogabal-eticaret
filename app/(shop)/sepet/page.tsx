import type { Metadata } from "next";
import { CartPageClient } from "@/components/shop/cart/CartPageClient";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Sepetim" };

export default function CartPage() {
  return (
    <Container size="wide" className="py-10">
      <h1 className="text-fluid-2xl font-black text-gray-900 mb-8">Alışveriş Sepeti</h1>
      <CartPageClient />
    </Container>
  );
}

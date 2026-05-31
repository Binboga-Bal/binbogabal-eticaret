import type { Metadata } from "next";
import { CartPageClient } from "@/components/shop/cart/CartPageClient";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Sepetim" };

export default function CartPage() {
  return (
    <Container size="content" className="pt-24 pb-10">
      <CartPageClient />
    </Container>
  );
}

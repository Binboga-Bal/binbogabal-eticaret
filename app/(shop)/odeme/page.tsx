export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout/CheckoutForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([
    prisma.siteSetting.findMany({
      where: { key: { in: ["cash_on_delivery_enabled", "shipping_fee", "shipping_threshold"] } },
    }),
    auth(),
  ]);
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const codEnabled = map["cash_on_delivery_enabled"] === "true";
  const shippingFee = Number(map["shipping_fee"] ?? 99);
  const shippingThreshold = Number(map["shipping_threshold"] ?? 1500);

  const addresses = session?.user?.id
    ? await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : [];

  const userEmail = session?.user?.email ?? "";

  return (
    /* max-w-wide kısıtla: checkout formu çok geniş uzamasın */
    <Container size="content" className="pt-24 pb-10 max-w-3xl px-8 lg:px-12">
      <CheckoutForm codEnabled={codEnabled} savedAddresses={addresses} userEmail={userEmail} shippingFee={shippingFee} shippingThreshold={shippingThreshold} />
    </Container>
  );
}

export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout/CheckoutForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const [codSetting, session] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "cash_on_delivery_enabled" } }),
    auth(),
  ]);
  const codEnabled = codSetting?.value === "true";

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
      <CheckoutForm codEnabled={codEnabled} savedAddresses={addresses} userEmail={userEmail} />
    </Container>
  );
}

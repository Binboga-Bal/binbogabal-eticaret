import type { Metadata } from "next";
import { CartPageClient } from "@/components/shop/cart/CartPageClient";
import { CartBanner } from "@/components/shop/cart/CartBanner";
import { Container } from "@/components/layout/Container";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Sepetim" };

export default async function CartPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["cart_banner_enabled", "cart_banner_text_left", "cart_banner_text_right", "cart_banner_color", "shipping_fee", "shipping_threshold"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const bannerEnabled = map["cart_banner_enabled"] === "true";
  const bannerTextLeft = map["cart_banner_text_left"] ?? "";
  const bannerTextRight = map["cart_banner_text_right"] ?? "";
  const bannerColor = map["cart_banner_color"] ?? "honey";
  const shippingFee = Number(map["shipping_fee"] ?? 99);
  const shippingThreshold = Number(map["shipping_threshold"] ?? 1500);

  return (
    <>
      {bannerEnabled && (bannerTextLeft || bannerTextRight) && (
        <CartBanner textLeft={bannerTextLeft} textRight={bannerTextRight} color={bannerColor} />
      )}
      <Container size="content" className="pt-24 pb-10">
        <CartPageClient bannerEnabled={bannerEnabled && !!(bannerTextLeft || bannerTextRight)} shippingFee={shippingFee} shippingThreshold={shippingThreshold} />
      </Container>
    </>
  );
}

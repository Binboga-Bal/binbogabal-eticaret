import { Header } from "@/components/shop/header/Header";
import { Footer } from "@/components/shop/footer/Footer";
import { SupportFAB } from "@/components/shop/support/SupportFAB";
import { headerTheme, footerTheme } from "@/lib/theme";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          "img_logo",
          "social_whatsapp",
          "social_instagram",
          "social_facebook",
          "contact_email",
          "contact_phone",
          "contact_address",
        ],
      },
    },
  }).catch(() => [] as { key: string; value: string }[]);

  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const logoSrc = s.img_logo ?? footerTheme.logo.src;

  // Müşteri tipi: oturum yoksa veya sipariş yoksa YENI_MUSTERI
  let customerType: "YENI_MUSTERI" | "MEVCUT_MUSTERI" = "YENI_MUSTERI";
  if (session?.user?.id) {
    const orderCount = await prisma.order
      .count({ where: { userId: session.user.id } })
      .catch(() => 0);
    customerType = orderCount > 0 ? "MEVCUT_MUSTERI" : "YENI_MUSTERI";
  }

  return (
    <>
      <Header logoSrc={logoSrc} />
      {/* paddingTop = duyuru bandı + nav — wave (waveDepth) içeriğin üstüne biner */}
      <main style={{ paddingTop: headerTheme.announcementHeight + headerTheme.navHeight }}>{children}</main>
      <Footer
        logoSrc={logoSrc}
        contactEmail={s.contact_email}
        contactPhone={s.contact_phone}
        contactAddress={s.contact_address}
        socialFacebook={s.social_facebook}
        socialInstagram={s.social_instagram}
        socialWhatsapp={s.social_whatsapp}
      />
      <SupportFAB
        whatsappNumber={s.social_whatsapp ?? ""}
        userName={session?.user?.name ?? null}
        userId={session?.user?.id ?? null}
        customerType={customerType}
      />
    </>
  );
}

import { Header } from "@/components/shop/header/Header";
import { Footer } from "@/components/shop/footer/Footer";
import { SupportFAB } from "@/components/shop/support/SupportFAB";
import { headerTheme, footerTheme } from "@/lib/theme";
import { prisma } from "@/lib/prisma";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [logoSetting, whatsappSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "img_logo" } }).catch(() => null),
    prisma.siteSetting.findUnique({ where: { key: "social_whatsapp" } }).catch(() => null),
  ]);
  const logoSrc = logoSetting?.value ?? footerTheme.logo.src;

  return (
    <>
      <Header logoSrc={logoSrc} />
      {/* paddingTop = duyuru bandı + nav — wave (waveDepth) içeriğin üstüne biner */}
      <main style={{ paddingTop: headerTheme.announcementHeight + headerTheme.navHeight }}>{children}</main>
      <Footer logoSrc={logoSrc} />
      <SupportFAB whatsappNumber={whatsappSetting?.value ?? ""} />
    </>
  );
}

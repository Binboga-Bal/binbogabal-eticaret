import { Header } from "@/components/shop/header/Header";
import { Footer } from "@/components/shop/footer/Footer";
import { headerTheme, footerTheme } from "@/lib/theme";
import { prisma } from "@/lib/prisma";

const MAIN_PT = headerTheme.solidHeight; // 125 px

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const logoSetting = await prisma.siteSetting.findUnique({ where: { key: "img_logo" } });
  const logoSrc = logoSetting?.value ?? footerTheme.logo.src;

  return (
    <>
      <Header logoSrc={logoSrc} />
      <main style={{ paddingTop: MAIN_PT }}>{children}</main>
      <Footer logoSrc={logoSrc} />
    </>
  );
}

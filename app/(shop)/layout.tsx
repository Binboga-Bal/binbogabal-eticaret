import { Header } from "@/components/shop/header/Header";
import { Footer } from "@/components/shop/footer/Footer";
import { headerTheme } from "@/lib/theme";

/**
 * Header fixed konumda olduğu için akıştan çıkar.
 * <main> paddingTop = solidHeight (duyuru + nav = 125 px) ile başlar.
 * Bu sayede wave'in alt kısmı (waveDepth = 90 px) içeriğin üstüne biner:
 *   • Hero image / slider olan sayfalarda wave, görselin üstüne çakışır ✓
 *   • Hero olmayan sayfalarda içerik görünür alanda başlar ✓
 *
 * ⚠️  solidHeight, announcementHeight + navHeight toplamıdır.
 *     theme.ts'te herhangi biri değişince solidHeight de güncellenmelidir.
 */
const MAIN_PT = headerTheme.solidHeight; // 125 px

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: MAIN_PT }}>{children}</main>
      <Footer />
    </>
  );
}

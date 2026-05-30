import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EmailVerifyBanner } from "@/components/shop/EmailVerifyBanner";
import { User, Package, MapPin, Heart, Tag, Star, Bell, ShieldCheck, LayoutDashboard } from "lucide-react";
import { LogoutButton } from "@/components/shop/LogoutButton";

const NAV_ITEMS = [
  { href: "/hesabim", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/hesabim/profilim", label: "Profilim", icon: User },
  { href: "/hesabim/siparislerim", label: "Siparişlerim", icon: Package },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPin },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: Heart },
  { href: "/hesabim/kuponlarim", label: "Kuponlarım", icon: Tag },
  { href: "/hesabim/yorumlarim", label: "Yorumlarım", icon: Star },
  { href: "/hesabim/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/hesabim/guvenlik", label: "Güvenlik", icon: ShieldCheck },
];

export default async function HesabimLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const dbUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true, email: true },
      })
    : null;
  const showVerifyBanner = session && !dbUser?.emailVerified;

  // Oturum yoksa yalnızca children'ı render et (giris/kayit sayfaları için)
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 pt-28 pb-16">
        {children}
      </div>
    );
  }

  return (
    <>
      {showVerifyBanner && <EmailVerifyBanner email={session.user.email ?? ""} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-32">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-honey-light hover:text-honey-dark transition-colors"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <LogoutButton />
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
}

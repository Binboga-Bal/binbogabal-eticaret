import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmailVerifyBanner } from "@/components/shop/EmailVerifyBanner";
import { LogoutButton } from "@/components/shop/LogoutButton";
import { HesabimNav } from "./HesabimNav";
import { headerTheme } from "@/lib/theme";

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
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        style={{ paddingTop: showVerifyBanner ? headerTheme.waveDepth + 40 : undefined }}
      >
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-32">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              </div>
              <HesabimNav />
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

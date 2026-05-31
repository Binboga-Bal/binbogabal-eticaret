import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmailVerifyBanner } from "@/components/shop/EmailVerifyBanner";
import { LogoutButton } from "@/components/shop/LogoutButton";
import { HesabimNav } from "./HesabimNav";
import { Container } from "@/components/layout/Container";

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
      <Container className="py-10">
        {/* Mobil: kullanıcı bilgisi + kompakt nav */}
        <div className="md:hidden mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
            <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <HesabimNav mobile />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 3xl:w-64 shrink-0">
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
          <main className="flex-1 min-w-0">
            {children}
            {/* Mobil çıkış butonu */}
            <div className="md:hidden mt-8 pt-6 border-t border-gray-100">
              <LogoutButton />
            </div>
          </main>
        </div>
      </Container>
    </>
  );
}

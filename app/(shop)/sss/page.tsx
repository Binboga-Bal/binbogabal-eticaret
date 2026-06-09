import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo/meta.service";
import { buildFaqSchema } from "@/lib/seo/schema/faq.schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page", "sss", {
    title: "Sık Sorulan Sorular | Binboğa Kooperatif Balı",
    description: "Binboğa bal ürünleri, sipariş ve teslimat hakkında sık sorulan sorular ve cevapları.",
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/sss`,
  });
}

export default async function SssPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const faqSchema = buildFaqSchema(
    faqs.map((f) => ({ q: f.question, a: f.answer }))
  );

  return (
    <>
      {faqs.length > 0 && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Sık Sorulan Sorular</h1>
        <p className="text-gray-500 text-sm mb-10">
          Ürünlerimiz, siparişleriniz ve teslimat hakkında merak ettikleriniz.
        </p>

        {faqs.length === 0 ? (
          <p className="text-gray-400 text-sm">Henüz soru-cevap eklenmemiş.</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-gray-900 hover:bg-honey-cream/60 transition-colors list-none">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-honey-dark transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-gray-100">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

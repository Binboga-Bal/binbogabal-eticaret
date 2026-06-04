import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";

export const revalidate = 86400;

export default async function robots(): Promise<MetadataRoute.Robots> {
  // DB'de özel robots config var mı kontrol et
  const config = await prisma.robotsConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  // Özel config varsa ham metin olarak döndür (Next.js bunu desteklemez, route.ts kullanılır)
  // Standart MetadataRoute.Robots formatını döndür
  return {
    rules: [
      // Genel tarayıcılar
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/hesabim/",
          "/sepet/",
          "/odeme/",
        ],
      },
      // OpenAI GPTBot — içerik indekslemesi için izin ver
      {
        userAgent: "GPTBot",
        allow: ["/", "/urunlerimiz/", "/bal-rehberi/", "/llm-content/", "/llms.txt"],
        disallow: ["/admin/", "/api/", "/hesabim/", "/sepet/", "/odeme/"],
      },
      // ChatGPT kullanıcı ajanı
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/urunlerimiz/", "/bal-rehberi/", "/llm-content/", "/llms.txt"],
        disallow: ["/admin/", "/api/", "/hesabim/", "/sepet/", "/odeme/"],
      },
      // Perplexity
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/urunlerimiz/", "/bal-rehberi/", "/llm-content/", "/llms.txt"],
        disallow: ["/admin/", "/api/", "/hesabim/", "/sepet/", "/odeme/"],
      },
      // Anthropic Claude
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/urunlerimiz/", "/bal-rehberi/", "/llm-content/", "/llms.txt"],
        disallow: ["/admin/", "/api/", "/hesabim/", "/sepet/", "/odeme/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/urunlerimiz/", "/bal-rehberi/", "/llm-content/", "/llms.txt"],
        disallow: ["/admin/", "/api/", "/hesabim/", "/sepet/", "/odeme/"],
      },
      // Google AI (Gemini)
      {
        userAgent: "Google-Extended",
        allow: ["/", "/urunlerimiz/", "/bal-rehberi/", "/llm-content/", "/llms.txt"],
        disallow: ["/admin/", "/api/", "/hesabim/", "/sepet/", "/odeme/"],
      },
      // Amazon Alexa
      {
        userAgent: "Amazonbot",
        allow: ["/", "/urunlerimiz/", "/bal-rehberi/"],
        disallow: ["/admin/", "/api/", "/hesabim/", "/sepet/", "/odeme/"],
      },
      // TikTok/ByteDance — tüm site engel
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
      // Common Crawl — tüm site engel
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

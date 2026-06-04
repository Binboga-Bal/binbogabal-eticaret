const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı",
    url: BASE_URL,
    description: "1973'ten bu yana Kozan'ın doğal kooperatif balı. Analizi yapılmış, üretici garantili.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
      addressRegion: "Adana",
      addressLocality: "Kozan",
    },
    areaServed: "TR",
    priceRange: "₺₺",
  };
}

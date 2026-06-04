const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.binbogabal.com.tr";
const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.png`,
    },
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Turkish",
    },
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/urunlerimiz?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface QaPair {
  q: string;
  a: string;
}

export function buildFaqSchema(pairs: QaPair[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((pair) => ({
      "@type": "Question",
      name: pair.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: pair.a,
      },
    })),
  };
}

import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Binboğa Kooperatif Balı",
    default: "Binboğa Kooperatif Balı - Kozan'dan Doğal Bal",
  },
  description:
    "1973'ten bu yana Kozan'ın Kooperatif Balı. Doğal, analizi yapılmış, üretici garantili bal.",
  keywords: ["bal", "kooperatif bal", "doğal bal", "Kozan balı", "Binboğa balı"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Binboğa Kooperatif Balı",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}

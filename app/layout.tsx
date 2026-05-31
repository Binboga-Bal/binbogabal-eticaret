import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Playfair_Display, Baloo_2, Lobster_Two } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-playfair",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
});

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lobster",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

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
    <html lang="tr" className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${baloo.variable} ${lobsterTwo.variable}`}>
      <body>{children}</body>
    </html>
  );
}

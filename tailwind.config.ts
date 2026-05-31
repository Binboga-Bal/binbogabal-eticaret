import type { Config } from "tailwindcss";
import { tailwindColors } from "./lib/theme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      // ── Mobil ──────────────────────────────
      xs:   "375px",   // iPhone SE, küçük Android
      sm:   "640px",   // Büyük telefon / küçük tablet
      // ── Tablet ─────────────────────────────
      md:   "768px",   // iPad portrait
      lg:   "1024px",  // iPad landscape / küçük laptop
      // ── Desktop ────────────────────────────
      xl:   "1280px",  // Standart laptop
      "2xl": "1536px", // Büyük masaüstü
      // ── Widescreen ─────────────────────────
      "3xl": "1920px", // Full HD monitör
      "4xl": "2560px", // 2K / 27" monitör
      "5xl": "3840px", // 4K / 43"+ TV & monitör
    },
    extend: {
      colors: {
        // Renk değerlerini merkezi tema dosyasından alır.
        // Değiştirmek için sadece lib/theme.ts'i düzenle.
        ...tailwindColors,
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        serif:   ["var(--font-playfair)", "Georgia", "serif"],
        script:  ["var(--font-lobster)", "cursive"],
      },
      // Max-width container sistemi
      maxWidth: {
        content:   "1280px",
        wide:      "1536px",
        ultrawide: "1920px",
        full:      "100%",
      },
      // Fluid spacing
      spacing: {
        "fluid-sm": "clamp(0.5rem, 1vw, 1rem)",
        "fluid-md": "clamp(1rem, 2vw, 2rem)",
        "fluid-lg": "clamp(1.5rem, 3vw, 4rem)",
        "fluid-xl": "clamp(2rem, 5vw, 8rem)",
      },
      // Fluid typography
      fontSize: {
        "fluid-sm":  ["clamp(0.75rem, 1.5vw, 0.875rem)",  { lineHeight: "1.5" }],
        "fluid-base":["clamp(0.875rem, 1.8vw, 1rem)",     { lineHeight: "1.6" }],
        "fluid-lg":  ["clamp(1rem, 2vw, 1.25rem)",        { lineHeight: "1.5" }],
        "fluid-xl":  ["clamp(1.25rem, 3vw, 2rem)",        { lineHeight: "1.4" }],
        "fluid-2xl": ["clamp(1.5rem, 4vw, 3rem)",         { lineHeight: "1.3" }],
        "fluid-3xl": ["clamp(2rem, 5vw, 4.5rem)",         { lineHeight: "1.2" }],
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-in-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "bounce-slow":"bounce 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

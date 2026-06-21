import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F5F0E8",
        teal: {
          forest: "#1B4D4A",
          deep: "#0D3B37",
        },
        amber: {
          gold: "#F19E05",
          light: "#F5B84A",
        },
        olive: {
          fresh: "#91C13E",
          lime: "#89B841",
          dark: "#5A8A2A",
        },
        cream: "#FAF7F2",
      },
      fontFamily: {
        arabic: ["var(--font-tajawal)", "Tahoma", "Arial", "sans-serif"],
        heading: ["var(--font-el-messiri)", "var(--font-tajawal)", "Tahoma", "sans-serif"],
        numeric: ["var(--font-tajawal)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        latin: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["var(--font-el-messiri)", "var(--font-tajawal)", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(145, 193, 62, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(145, 193, 62, 0.4)" },
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(27, 77, 74, 0.08)",
        "card-hover": "0 8px 32px rgba(27, 77, 74, 0.15)",
        glow: "0 0 40px rgba(145, 193, 62, 0.3)",
        premium: "0 8px 40px rgba(13, 59, 55, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

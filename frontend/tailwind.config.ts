import type { Config } from "tailwindcss";

/** Matches www/styles.css Barbazza design tokens (light classic) */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#f8f8f8",
        field: "#f0f0f0",
        line: "#e8e8e8",
        gold: "#0a0a0a",
        cream: "#2a2a2a",
        mute: "#6a6a6a",
        burgundy: "#6b1f1f",
        success: "#2d5a3f",
        error: "#c0392b",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Playfair Display", "serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 14px rgba(0, 0, 0, 0.06)",
        glow: "0 12px 28px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;

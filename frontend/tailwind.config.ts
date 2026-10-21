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
        card: "0 4px 8px rgba(0, 0, 0, 0.1)",
        glow: "0 8px 16px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

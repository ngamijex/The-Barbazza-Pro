import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0c0b0a",
        ink: "#121110",
        panel: "#1a1816",
        field: "#24211e",
        line: "rgba(201, 162, 39, 0.18)",
        gold: "#c9a227",
        "gold-soft": "#e4c76a",
        cream: "#f3efe6",
        mute: "#9a9286",
        burgundy: "#8b2e2e",
        success: "#3d7a56",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(201, 162, 39, 0.12)",
        lift: "0 18px 40px rgba(0, 0, 0, 0.45)",
        card: "0 8px 24px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      backgroundImage: {
        "barbazza-grain":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,162,39,0.16), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(139,46,46,0.08), transparent)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        rise: "rise 0.45s ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

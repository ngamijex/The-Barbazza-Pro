import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090807",
        panel: "#141210",
        line: "#2a241c",
        gold: "#d4af37",
        cream: "#f6f1e8",
        mute: "#a39888",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0,0,0,.45)",
      },
    },
  },
  plugins: [],
};

export default config;

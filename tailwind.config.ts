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
        cream: "#F5F0E8",
        ink: "#1A1612",
        gold: "#B8860B",
        "gold-light": "#D4A520",
        "gold-pale": "#F5EDD0",
        muted: "#6B6157",
        vakif: {
          green: "#1A5C3A",
          "green-light": "#E8F3EC",
          red: "#8B2020",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

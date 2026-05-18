import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8faf7",
        foreground: "#17211b",
        primary: "#2f6f4e",
        muted: "#eef3ee"
      }
    }
  },
  plugins: []
};

export default config;

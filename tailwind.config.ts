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
        background: "var(--background)",
        foreground: "var(--foreground)",
        campaign: {
          dark: "#0f172a",
          darker: "#020617",
          light: "#f8fafc",
          card: "#ffffff",
          border: "#e2e8f0",
          red: "#dc2626",
          green: "#16a34a",
          amber: "#d97706",
          blue: "#2563eb",
          purple: "#7c3aed"
        }
      },
    },
  },
  plugins: [],
};
export default config;

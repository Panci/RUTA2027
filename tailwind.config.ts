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
        },
        pastel: {
          coral: "#fb7185",
          rose: "#fda4af",
          blush: "#fff1f2",
          peach: "#fdba74",
          cream: "#fef3c7",
          mint: "#6ee7b7",
          sage: "#a7f3d0",
          sky: "#93c5fd",
          lavender: "#c4b5fd",
          lilac: "#e9d5ff",
          sand: "#f5f5f4",
          slate: "#334155",
        }
      },
    },
  },
  plugins: [],
};
export default config;

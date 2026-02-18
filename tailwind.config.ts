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
        // Wii Fit Studio - Neutrals
        wii: {
          white: "#F7FBFF",
          mist: "#EAF3FA",
          glass: "#CFE6F2",
          ink: "#11202B",
          muted: "#516777",
        },
        // Studio blues
        studio: {
          blue: "#4C79D8",
          aqua: "#7FE3E6",
          teal: "#23C6C8",
        },
        // Ring accents
        ring: {
          orange: "#FF9A3D",
          blue: "#2D8CFF",
          pink: "#FF4FA7",
        },
        // Keep functional colors
        mojo: {
          green: "#10B981",
          red: "#EF4444",
          orange: "#FF9A3D",
          purple: "#4C79D8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        glass: "20px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(76, 121, 216, 0.08)",
        "glass-hover": "0 12px 40px rgba(76, 121, 216, 0.15)",
        float: "0 4px 20px rgba(0, 0, 0, 0.06)",
        ring: "0 0 24px rgba(45, 140, 255, 0.3)",
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "float": "float 3s ease-in-out infinite",
        "float-up": "float-up 2.5s ease-out forwards",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 16px rgba(45, 140, 255, 0.2)" },
          "50%": { boxShadow: "0 0 32px rgba(45, 140, 255, 0.5)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-300px)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
const config: Config = {
  darkMode: ["selector"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "385px",
      ...defaultTheme.screens,
    },
    extend: {
      screens: {
        nohover: { raw: "(hover: none)" },
      },
      animation: {
        return: "return 1s ease-in-out",
        shrink: "shrink 1s ease-in-out",
        'pulse-fast':" pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        return: {
          "0%": { transform: "scale(0.75)" },
          "100%": { transform: "scale(1)" },
        },
        shrink: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.75)" },
        },
      },
      boxShadow: {
        fuller:
          "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 26px",
        abc: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px;",
      },
      fontFamily: {
        honk: ["var(--font-honk)"],
      },
      colors: {
        navbar: "var(--navbar)",
        background: "var(--bg)",
        text: "var(--text)",
        slider: "var(--slider)",
        modal: "var(--modal)",
        accent: "var(--accent)",
        shadow: "var(--shadow)",
        "base-green": "var(--base-green)",
        "accent-base":"var(--accent-base)",
        "text-base": "var(--text-base)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        gradientconic:
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        starfall: "linear-gradient(to right, #f0c27b, #4b1248)",
        parklife: "linear-gradient(to right, #add100, #7b920a);",
        strain: "linear-gradient(to right, #870000, #190a05)",
        "gradient-digi":
          "linear-gradient(180deg, rgba(236,226,21,1) 0%, rgba(247,222,17,1) 33%, rgba(239,0,255,1) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;

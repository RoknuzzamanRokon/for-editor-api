import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        'background-light': '#f6f6f8',
        'background-dark': '#111621',
      },
      fontFamily: {
        display: ['var(--font-sans)'],
        mono: ['var(--font-code)'],
      },
    },
  },
  plugins: [],
};
export default config;

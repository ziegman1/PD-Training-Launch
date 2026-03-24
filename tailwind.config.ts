import type { Config } from "tailwindcss";

/**
 * Launch — Tailwind v4
 *
 * Colors, font sizes, and semantic text styles are defined in `app/globals.css`
 * under `@theme inline` so they generate utilities (`bg-launch-navy`, `text-slide-title`, …).
 *
 * This file keeps the default content paths explicit for tooling and future extensions.
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config;

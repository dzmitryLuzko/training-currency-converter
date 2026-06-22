import type { Config } from "tailwindcss";

/**
 * "Change Bureau" design tokens.
 * Palette and type roles are intentionally specific to a foreign-exchange
 * terminal — deep counter "ink", ivory ticket "paper", and a brass accent.
 */
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0C2A27", // deep petrol-green — the counter backdrop
        paper: "#F4EEE0", // warm ivory — the ticket surface
        brass: "#C2922E", // brass accent — active elements, the rate line
        muted: "#5C6B66", // subdued labels / captions
        alert: "#C0492F", // validation & API errors only
        line: "rgba(12, 42, 39, 0.12)", // hairlines & perforation
      },
      fontFamily: {
        // Space Grotesk carries the UI voice; IBM Plex Mono carries every figure.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/cssClasses.ts",
    "./public/images/**/*.svg",
    "./_posts/**/*.md",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        cursive: ["Square Peg", "cursive"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
};

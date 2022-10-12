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
      boxShadow: {
        "lg-bottom":
          "0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)",
        "xl-bottom":
          "0 -20px 25px -5px rgb(0 0 0 / 0.1), 0 -8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      animation: {
        "spin-cloud": "spin-inverse 140s linear infinite",
        "spin-cloud-2": "spin-inverse 150s linear infinite",
        "spin-cloud-3": "spin-inverse 160s linear infinite",
      },
      keyframes: {
        "spin-inverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        cursive: ["Square Peg", "cursive"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme("colors.blue.700"),
              "&:hover": {
                color: theme("colors.blue.600"),
              },
            },
          },
        },
        invert: {
          css: {
            a: {
              color: theme("colors.blue.500"),
              "&:hover": {
                color: theme("colors.blue.600"),
              },
            },
          },
        },
      }),
    },
    corePlugins: {
      aspectRatio: false,
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")({
      strategy: "base", // only generate global styles
      // strategy: "class", // only generate classes
    }),
  ],
};

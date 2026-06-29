import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "public/**",
      "api/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.mjs",
    ],
  },
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    rules: {
      "@next/next/no-img-element": "off",
      // Experimental React Compiler rules enabled by eslint-config-next 16. This
      // app doesn't use the React Compiler, and they flag idiomatic patterns: the
      // next-themes mount guard (`setMounted(true)`) and a self-scheduling
      // requestAnimationFrame loop.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;

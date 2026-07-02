const { platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        mono: platformSelect({ ios: 'ui-monospace', android: 'monospace', default: 'var(--font-mono)' }),
      },
      colors: require('./tailwind.tokens.cjs'),
    },
  },
  plugins: [],
};

/** @type {import('prettier').Config} */
module.exports = {
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.js',
  tailwindAttributes: ['className'],
};

// Compresses the SVGs in `assets/` (see `pnpm svg:optimize`).
module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep viewBox so the art scales instead of being clipped.
          removeViewBox: false,
        },
      },
    },
  ],
};

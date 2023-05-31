const axios = require("axios");
const { i18n } = require("./next-i18next.config");

const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.test/api",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // async redirects() {
  //   const { data } = await Api.get(`/slug-history`);

  //   return data.map(({ slug, new_slug }) => ({
  //     source: `/posts/${slug}`,
  //     destination: `/posts/${new_slug}`,
  //     permanent: true,
  //   }));
  // },
  reactStrictMode: true,
  swcMinify: true,
  experimental: { images: { allowFutureImage: true } },
  i18n,
};

module.exports = nextConfig;

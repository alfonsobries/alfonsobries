const axios = require("axios");

const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.com/api",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    const { data } = await Api.get(`/slug-history`);

    // Current hardcoded for articles, make it dynamic if needed
    return data.map(({ slug, new_slug }) => ({
      source: `/posts/${slug}`,
      destination: `/posts/${new_slug}`,
      permanent: true,
    }));
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: { images: { allowFutureImage: true } },
};

module.exports = nextConfig;

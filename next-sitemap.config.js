const axios = require("axios");

const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.test/api",
});

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.alfonsobries.com",
  generateRobotsTxt: true,
  changefreq: "monthly",
  priority: 0.7,
  transform: async (config, path) => {
    const overrides = {};

    if (path.startsWith("/secret") || path.includes("print")) {
      return false;
    }

    if (path === "/") {
      overrides.priority = 1;
      overrides.changefreq = "weekly";
    }

    if (path === "/posts" || path.startsWith("/posts/page")) {
      overrides.changefreq = "weekly";
      overrides.priority = 0.9;
    } else if (path.startsWith("/posts/")) {
      const slug = path.split("/posts/")[1];
      const { data } = await Api.get(`/articles/${slug}`);
      overrides.priority = 0.8;
      overrides.lastmod = new Date(Date.parse(data.updated_at)).toISOString();
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
      ...overrides,
    };
  },
};

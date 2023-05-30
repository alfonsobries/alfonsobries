const axios = require("axios");

const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.test/api",
});

const alternates = {
  "/contact": "/contacto",
  "/about": "/sobre-mi",
  "/labs": "/labs",
};

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.alfonsobries.com",
  generateIndexSitemap: false,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/resume", "/es/curriculum", "/secret/*"],
      },
    ],
  },

  changefreq: "monthly",
  priority: 0.7,
  exclude: [
    "/resume",
    "/publicaciones",
    "/curriculum",
    "/secret/*",
    "/es",
    "/es/*",
    "*print",
    ...Object.values(alternates),
  ],

  transform: async (config, path) => {
    const overrides = {};

    if (path === "/") {
      overrides.priority = 1;
      overrides.changefreq = "weekly";
      overrides.alternateRefs = [
        {
          href: `${process.env.SITE_URL || "https://www.alfonsobries.com"}/es`,
          hreflang: "es",
          hrefIsAbsolute: true,
        },
      ];
    } else if (alternates[path] !== undefined) {
      overrides.alternateRefs = [
        {
          href: `${process.env.SITE_URL || "https://www.alfonsobries.com"}/es${
            alternates[path]
          }`,
          hreflang: "es",
          hrefIsAbsolute: true,
        },
      ];
    } else if (path === "/posts" || path.startsWith("/posts/page")) {
      overrides.changefreq = "weekly";
      overrides.priority = 0.9;

      if (path === "/posts") {
        overrides.alternateRefs = [
          {
            href: `${
              process.env.SITE_URL || "https://www.alfonsobries.com"
            }/es/publicaciones`,
            hreflang: "es",
            hrefIsAbsolute: true,
          },
        ];
      } else {
        const page = path.split("/posts/page/")[1];

        overrides.alternateRefs = [
          {
            href: `${
              process.env.SITE_URL || "https://www.alfonsobries.com"
            }/es/publicaciones/page/${page}`,
            hreflang: "es",
            hrefIsAbsolute: true,
          },
        ];
      }
    } else if (path.startsWith("/posts/")) {
      const slug = path.split("/posts/")[1];

      const { data } = await Api.get(`/articles/${slug}`);

      overrides.priority = 0.8;
      overrides.lastmod = new Date(Date.parse(data.updated_at)).toISOString();

      overrides.images = [
        {
          loc: {
            href: `https://og.alfonsobries.com/${encodeURIComponent(
              data.title.en
            )}.png`,
          },
        },
      ];

      overrides.news = {
        title: data.title.en,
        publicationName: "Alfonso's Blog",
        publicationLanguage: "en",
        date: overrides.lastmod,
      };

      overrides.alternateRefs = [
        {
          href: `${
            process.env.SITE_URL || "https://www.alfonsobries.com"
          }/es/publicaciones/${data.slug.es}`,
          hreflang: "es",
          hrefIsAbsolute: true,
        },
      ];
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      ...overrides,
    };
  },
};

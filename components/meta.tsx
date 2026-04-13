import Head from "next/head";
import { useRouter } from "next/router";
import { SITE_URL } from "../lib/constants";
import { TFunction } from "next-i18next";
import { useMemo } from "react";

type Props = {
  children?: React.ReactNode;
  meta: {
    title?: string;
    description: string;
    image?: string;
    ogType?: string;
    hidePageName?: boolean;
  };
  hreflangUrl?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  t: TFunction;
};

const Meta = ({ meta, children, hreflangUrl, jsonLd, t }: Props) => {
  const { asPath, locale } = useRouter();

  if (meta.description.length > 160 && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `Meta description exceeds 160 chars (${meta.description.length}): ${meta.description}`
    );
  }

  const image =
    meta.image ||
    `https://og.alfonsobries.com/${encodeURIComponent(
      meta.title || t("common:site_title")
    )}.png`;

  const title = useMemo(() => {
    if (meta.hidePageName) {
      return meta.title;
    }

    if (meta.title) {
      return `${meta.title} • ${t("common:site_title")}`;
    }

    return t("common:site_title");
  }, [meta, t]);

  const pathWithoutQuery = asPath.split("?")[0];
  const localePrefix = locale && locale !== "en" ? `/${locale}` : "";
  const canonical = `${SITE_URL}${localePrefix}${pathWithoutQuery}`;

  const ogLocale = locale === "es" ? "es_ES" : "en_US";
  const ogLocaleAlternate = locale === "es" ? "en_US" : "es_ES";

  const siteName = t("common:site_title");

  return (
    <Head>
      <title>{title}</title>

      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content="#ffffff"
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content="#111827"
      />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlternate} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@alfonsobries" />
      <meta name="author" content="Alfonso Bribiesca" />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={meta.ogType || "website"} />
      <meta name="twitter:site" content="@alfonsobries" />
      {hreflangUrl && (
        <>
          <link
            rel="alternate"
            hrefLang={locale === "es" ? "en" : "es"}
            href={`${SITE_URL}${hreflangUrl}`}
          />
          <link rel="alternate" hrefLang={locale} href={canonical} />
          <link
            rel="alternate"
            hrefLang="x-default"
            href={locale === "en" ? canonical : `${SITE_URL}${hreflangUrl}`}
          />
        </>
      )}

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              Array.isArray(jsonLd) ? jsonLd : [jsonLd]
            ),
          }}
        />
      )}

      {children}
    </Head>
  );
};

export default Meta;

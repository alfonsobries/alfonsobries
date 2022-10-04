import Head from "next/head";
import { useRouter } from "next/router";
import { CMS_NAME, SITE_URL } from "../lib/constants";

type Props = {
  children?: React.ReactNode;
  meta: {
    title: string;
    description: string;
    image?: string;
    ogType?: string;
  };
};

const Meta = ({ meta, children }: Props) => {
  const { asPath } = useRouter();

  if (meta.description.length > 155) {
    throw new Error("Meta Description is too long");
  }

  return (
    <Head>
      <title>
        {meta.title} | {CMS_NAME}
      </title>
      <meta name="description" content={meta.description} />
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
      <meta name="theme-color" content="#000" />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta
        name="twitter:image"
        content={
          meta.image ||
          `https://og.alfonsobries.com/${encodeURIComponent(meta.title)}.png`
        }
      />
      <meta name="author" content="Alfonso Bribiesca" />
      <meta property="og:url" content={`${SITE_URL}${asPath}`} />
      <meta property="og:type" content={meta.ogType || "website"} />
      <meta name="twitter:site" content="@alfonsobries" />
      {children}
    </Head>
  );
};

export default Meta;

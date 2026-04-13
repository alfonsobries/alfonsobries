import { SITE_URL } from "./constants";
import { Post } from "../interfaces/post";

export const personSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Alfonso Bribiesca",
  alternateName: "alfonsobries",
  url: SITE_URL,
  image: `${SITE_URL}/images/og/main.png`,
  jobTitle: "Full-Stack Software Engineer",
  sameAs: [
    "https://twitter.com/alfonsobries",
    "https://github.com/alfonsobries",
    "https://www.linkedin.com/in/alfonsobries",
  ],
});

export const websiteSchema = (siteName: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: SITE_URL,
  inLanguage: ["en", "es"],
  author: {
    "@type": "Person",
    name: "Alfonso Bribiesca",
  },
});

export const blogPostingSchema = ({
  post,
  url,
  locale,
}: {
  post: Post;
  url: string;
  locale: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.meta_description || post.excerpt,
  image: `https://og.alfonsobries.com/${encodeURIComponent(post.title)}.png`,
  datePublished: post.published_at,
  dateModified: (post as unknown as { updated_at?: string }).updated_at || post.published_at,
  inLanguage: locale,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url,
  },
  author: {
    "@type": "Person",
    name: "Alfonso Bribiesca",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Person",
    name: "Alfonso Bribiesca",
    url: SITE_URL,
  },
});

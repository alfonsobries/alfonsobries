import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPosts } from "../lib/api";
import { Post } from "../interfaces/post";
import ArticleListItem from "../components/article-list-item";
import classNames from "classnames";
import { LINK_COLOR_BORDER, LINK_COLOR_TEXT } from "../lib/cssClasses";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import urls from "../helpers/urls";
import { LocaleCode } from "../interfaces/localization";
import { personSchema, websiteSchema } from "../lib/jsonLd";
type Props = {
  posts: Post[];
  hasMorePosts: boolean;
};

export default function Index({ posts, hasMorePosts }: Props) {
  const { locale } = useRouter();

  const { t } = useTranslation();

  return (
    <>
      <Layout
        meta={{
          title: t("common:home.meta_title"),
          description: t("common:home.meta_description"),
          image: "https://www.alfonsobries.com/images/og/main.png",
        }}
        hreflangUrl={urls.home({
          locale: locale === "en" ? "es" : "en",
        })}
        jsonLd={[personSchema(), websiteSchema(t("common:site_title"))]}
        t={t}
      >
        <Container>
          <div className="prose dark:prose-invert prose-h2:text-lg">
            <h1>{t("common:latest_posts")}</h1>

            <div className="mt-8 space-y-12">
              {posts.map((post) => (
                <ArticleListItem
                  key={post.slug}
                  post={post}
                  locale={locale as LocaleCode}
                  t={t}
                />
              ))}
            </div>
          </div>

          {hasMorePosts && (
            <Link
              href={`/posts`}
              className={classNames(
                LINK_COLOR_BORDER,
                LINK_COLOR_TEXT,
                "mt-8 block rounded border p-2 text-center"
              )}
            >
              {t("common:more_posts")} →
            </Link>
          )}
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async ({ locale }) => {
  const posts = await getAllPosts(
    ["title", "slug", "excerpt", "published_at", "body"],
    {
      limit: 3,
    },
    locale
  );

  return {
    props: {
      posts: posts.data,
      hasMorePosts: posts.next_page_url !== null,
      ...(await serverSideTranslations(locale)),
    },
  };
};

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
          title: "An average human being",
          description:
            "Hello, it’s me, Alfonso. On this website you can find a little bit about my work and my interests, it is also a good place to connect. Please come in",
          image: "https://www.alfonsobries.com/images/og/main.png",
        }}
        hreflangUrl={urls.home({
          locale: locale === "en" ? "es" : "en",
        })}
      >
        <Container>
          <div className="prose prose-h2:text-lg dark:prose-invert">
            <h1>Latest Posts</h1>

            {posts.map((post) => (
              <ArticleListItem
                key={post.slug}
                post={post}
                locale={locale as LocaleCode}
              />
            ))}
          </div>

          {hasMorePosts && (
            <Link href={`/posts`}>
              <a
                className={classNames(
                  LINK_COLOR_BORDER,
                  LINK_COLOR_TEXT,
                  "mt-8 block rounded border p-2 text-center"
                )}
              >
                More Posts →
              </a>
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
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

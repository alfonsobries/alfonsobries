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
      >
        <Container>
          <div className="prose prose-h2:text-lg dark:prose-invert">
            <h1>Latest Posts</h1>

            <p>{t("description")}</p>

            <Link
              href="/"
              locale={locale === "es" ? "en" : "es"}
              className="bg-red-100 p-3"
            >
              <a>To /{locale === "es" ? "en" : "es"}/another</a>
            </Link>

            {posts.map((post) => (
              <ArticleListItem key={post.slug} post={post} />
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
    }
  );

  console.log("LOCALE", locale);

  return {
    props: {
      posts: posts.data,
      hasMorePosts: posts.next_page_url !== null,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

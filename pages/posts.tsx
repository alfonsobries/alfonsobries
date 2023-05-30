import ArticleListItem from "../components/article-list-item";
import Container from "../components/container";
import Layout from "../components/layout";
import Pagination from "../components/pagination";
import { Post } from "../interfaces/post";
import { Pagination as PaginationType } from "../interfaces/pagination";
import { getAllPosts } from "../lib/api";
import { useMemo } from "react";
import { LocaleCode } from "../interfaces/localization";
import urls from "../helpers/urls";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const POST_PER_PAGE = 5;

type Props = {
  pagination: PaginationType<Post>;
  locale: LocaleCode;
};

export default function Posts({ pagination, locale }: Props) {
  const subtitle = useMemo(() => {
    return `${
      pagination.current_page > 1 ? `Page ${pagination.current_page}` : ""
    }`;
  }, [pagination.current_page]);

  const metaTitle = useMemo(() => {
    return `${
      pagination.current_page > 1
        ? `Posts - Page ${pagination.current_page}`
        : "Posts"
    }`;
  }, [pagination.current_page]);

  const { t } = useTranslation();

  return (
    <>
      <Layout
        meta={{
          title: metaTitle,
          description:
            "Posts related to frontend and backend development, design, technology, and maybe other subjects that I may find interesting.",
          image: `https://og.alfonsobries.com/Latest%20Blog%Posts.png`,
        }}
        hreflangUrl={urls.posts({
          locale: locale === "en" ? "es" : "en",
          page: pagination.current_page,
        })}
        t={t}
      >
        <Container>
          <div className="prose prose-h2:text-lg dark:prose-invert">
            <h1>
              Posts
              {subtitle && (
                <>
                  <span className="text-base font-normal text-gray-500">
                    {" "}
                    / {subtitle}
                  </span>
                </>
              )}
            </h1>

            {pagination.data.map((post) => (
              <ArticleListItem key={post.slug} post={post} locale={locale} />
            ))}
          </div>

          <Pagination pagination={pagination} path={urls.posts({ locale })} />
        </Container>
      </Layout>
    </>
  );
}

type Params = {
  params?: {
    page?: number;
  };
  locale: LocaleCode;
};

export const getStaticProps = async ({ params, locale }: Params) => {
  const pagination: PaginationType<Post> = await getAllPosts(
    ["title", "slug", "excerpt", "published_at", "body"],
    {
      limit: POST_PER_PAGE,
      ...params,
    },
    locale
  );

  return {
    props: {
      locale,
      pagination,
      ...(await serverSideTranslations(locale)),
    },
  };
};

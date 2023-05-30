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
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const POST_PER_PAGE = 5;

type Props = {
  pagination: PaginationType<Post>;
  locale: LocaleCode;
};

export default function Posts({ pagination, locale }: Props) {
  const { t } = useTranslation();

  const subtitle = useMemo(() => {
    if (pagination.current_page > 1) {
      return t("common:posts.subtitle_page", { page: pagination.current_page });
    }
    return "";
  }, [pagination.current_page, t]);

  const metaTitle = useMemo(() => {
    if (pagination.current_page > 1) {
      return t("common:posts.meta_title_page", {
        page: pagination.current_page,
      });
    }

    return t("common:posts.meta_title");
  }, [pagination.current_page, t]);

  return (
    <>
      <Layout
        meta={{
          title: metaTitle,
          description: t("common:posts.meta_description"),
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
              {t("common:posts.title")}

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
              <ArticleListItem
                t={t}
                key={post.slug}
                post={post}
                locale={locale}
              />
            ))}
          </div>

          <Pagination
            t={t}
            pagination={pagination}
            path={urls.posts({ locale })}
          />
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

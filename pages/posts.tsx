import ArticleListItem from "../components/article-list-item";
import Container from "../components/container";
import Layout from "../components/layout";
import Pagination from "../components/pagination";
import { Post } from "../interfaces/post";
import { Pagination as PaginationType } from "../interfaces/pagination";
import { getAllPosts } from "../lib/api";
import { useMemo } from "react";

export const POST_PER_PAGE = 5;

type Props = {
  pagination: PaginationType<Post>;
};

export default function Posts({ pagination }: Props) {
  const subtitle = useMemo(() => {
    return `${
      pagination.current_page > 1 ? `Page ${pagination.current_page}` : ""
    }`;
  }, [pagination.current_page]);

  return (
    <>
      <Layout
        meta={{
          title: `Posts - ${subtitle}`,
          description:
            "Posts related to frontend and backend development, design, technology, and maybe other subjects that I may find interesting.",
          image: `https://og.alfonsobries.com/Latest%20Blog%Posts.png`,
        }}
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
              <ArticleListItem key={post.slug} post={post} />
            ))}
          </div>

          <Pagination pagination={pagination} path="/posts" />
        </Container>
      </Layout>
    </>
  );
}

type Params = {
  params?: {
    page?: number;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  const pagination: PaginationType<Post> = await getAllPosts(
    ["title", "slug", "excerpt", "published_at", "body"],
    {
      limit: POST_PER_PAGE,
      ...params,
    }
  );

  return {
    props: {
      pagination,
    },
  };
};

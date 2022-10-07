import ArticleListItem from "../../../components/article-list-item";
import Container from "../../../components/container";
import Layout from "../../../components/layout";
import Pagination from "../../../components/pagination";
import { Post } from "../../../interfaces/post";
import { Pagination as PaginationType } from "../../../interfaces/pagination";
import { getAllPosts } from "../../../lib/api";

const POST_PER_PAGE = 3;

type Props = {
  pagination: PaginationType<Post>;
};

export default function Posts({ pagination }: Props) {
  return (
    <>
      <Layout
        meta={{
          title: "Posts",
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
        }}
      >
        <Container>
          <div className="prose prose-h2:text-lg dark:prose-invert">
            <h1>Posts</h1>

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
  params: {
    page: number;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  const pagination: PaginationType<Post> = await getAllPosts(
    ["title", "slug", "excerpt"],
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

export async function getStaticPaths() {
  const pagination: PaginationType<Post> = await getAllPosts([], {
    limit: 1,
  });

  const totalPages = Math.ceil(pagination.total / POST_PER_PAGE);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  console.log({ pages, totalPages });

  return {
    paths: pages.map((page) => {
      return {
        params: {
          page: page.toString(),
        },
      };
    }),
    fallback: false,
  };
}

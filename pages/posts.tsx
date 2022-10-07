import ArticleListItem from "../components/article-list-item";
import Container from "../components/container";
import Layout from "../components/layout";
import Pagination from "../components/pagination";
import { Post } from "../interfaces/post";
import { Pagination as PaginationType } from "../interfaces/pagination";
import { getAllPosts } from "../lib/api";

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

export const getStaticProps = async () => {
  const pagination = await getAllPosts(["title", "slug", "excerpt"], {
    limit: 3,
  });

  return {
    props: {
      pagination,
    },
  };
};

import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPosts } from "../lib/api";
import { Post } from "../interfaces/post";
import ArticleListItem from "../components/article-list-item";
import classNames from "classnames";
import {
  BORDER_COLOR,
  LINK_COLOR_BORDER,
  LINK_COLOR_TEXT,
} from "../lib/cssClasses";

type Props = {
  allPosts: Post[];
  hasMorePosts: boolean;
};

export default function Index({ allPosts, hasMorePosts }: Props) {
  const posts = allPosts.slice(0, 3);

  return (
    <>
      <Layout
        meta={{
          title: "Tech, Development, and more",
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
        }}
      >
        <Container>
          <div className="prose prose-h2:text-lg dark:prose-invert">
            <h1>Latest Posts</h1>

            {posts.map((post) => (
              <ArticleListItem key={post.slug} post={post} />
            ))}
          </div>

          {hasMorePosts && (
            <a
              className={classNames(
                LINK_COLOR_BORDER,
                LINK_COLOR_TEXT,
                "mt-8 block rounded border p-2 text-center text-white"
              )}
              href=""
            >
              More Posts...
            </a>
          )}
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const posts = await getAllPosts(["title", "slug", "excerpt"], 3);

  return {
    props: {
      allPosts: posts.data,
      hasMorePosts: posts.next_page_url !== null,
    },
  };
};

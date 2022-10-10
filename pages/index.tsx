import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPosts } from "../lib/api";
import { Post } from "../interfaces/post";
import ArticleListItem from "../components/article-list-item";
import classNames from "classnames";
import { LINK_COLOR_BORDER, LINK_COLOR_TEXT } from "../lib/cssClasses";
import Link from "next/link";

type Props = {
  posts: Post[];
  hasMorePosts: boolean;
};

export default function Index({ posts, hasMorePosts }: Props) {
  return (
    <>
      <Layout
        meta={{
          title: "A human being who happens to make software",
          description:
            "Hello, it’s me, Alfonso, on this website. Here you can find a little bit about my work and my interests, it is also a good place to connect. Please come in",
          image: "https://www.alfonsobries.com/images/og/main.png",
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

export const getStaticProps = async () => {
  const posts = await getAllPosts(
    ["title", "slug", "excerpt", "published_at", "body"],
    {
      limit: 3,
    }
  );

  return {
    props: {
      posts: posts.data,
      hasMorePosts: posts.next_page_url !== null,
    },
  };
};

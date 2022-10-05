import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import PostHeader from "../../components/post-header";
import Layout from "../../components/layout";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import PostTitle from "../../components/post-title";
import markdownToHtml from "../../lib/markdownToHtml";
import { Post as PostType } from "../../interfaces/post";

type Props = {
  post: PostType;
  content: string;
  morePosts: PostType[];
  preview?: boolean;
};

export default function Post({ post, content, morePosts, preview }: Props) {
  const router = useRouter();

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout
      meta={{
        title: post.title,
        description: post.meta_description || post.excerpt,
        ogType: "article",
      }}
    >
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="prose dark:prose-invert">
              <PostHeader
                title={post.title}
                // coverImage={post.coverImage}
                date={post.published_at}
                // author={post.author}
              />

              <PostBody content={content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const post = await getPostBySlug(params.slug, [
    "title",
    "meta_description",
    "excerpt",
    "body",
    "published_at",
    "slug",
    // "author",
    // "content",
    // "ogImage",
    // "coverImage",
  ]);

  const content = await markdownToHtml(post.body || "");

  return {
    props: {
      content,
      post,
    },
  };
}

export async function getStaticPaths() {
  const posts = await getAllPosts(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}

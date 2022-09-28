import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import PostHeader from "../../components/post-header";
import Layout from "../../components/layout";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import PostTitle from "../../components/post-title";
import Head from "next/head";
import { CMS_NAME } from "../../lib/constants";
import markdownToHtml from "../../lib/markdownToHtml";
import type PostType from "../../interfaces/post";

type Props = {
  post: PostType;
  morePosts: PostType[];
  preview?: boolean;
};

export default function Post({ post, morePosts, preview }: Props) {
  const router = useRouter();

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout>
      <Container>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="prose dark:prose-invert">
              <Head>
                <title>
                  {post.title} | {CMS_NAME}
                </title>
                <meta name="description" content={post.meta_description} />
                <meta property="og:title" content={post.title} />
                <meta
                  property="og:description"
                  content={post.meta_description}
                />
                <meta
                  property="og:image"
                  content={`https://og.alfonsobries.com/${encodeURI(
                    post.title
                  )}`}
                />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta
                  name="twitter:description"
                  content={post.meta_description}
                />
                <meta
                  name="twitter:image"
                  content={`https://og.alfonsobries.com/${encodeURI(
                    post.title
                  )}`}
                />
                <meta name="author" content="reece" />
                <meta
                  property="og:url"
                  content={`https://www.alfonsobries.com/blog/${post.slug}`}
                />
                <meta property="og:type" content="article" />
                <meta name="twitter:site" content="@alfonsobries" />
              </Head>

              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
              />

              <pre>{JSON.stringify(post)}</pre>

              <PostBody content={post.content} />
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
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
    "coverImage",
  ]);

  const content = await markdownToHtml(post.body || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = await getAllPosts();

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

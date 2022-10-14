import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../../../../components/container";
import Layout from "../../../../components/layout";
import markdownToHtml from "../../../../lib/markdownToHtml";
import { Post as PostType } from "../../../../interfaces/post";
import DateFormatter from "../../../../components/date-formatter";
import ReadTime from "../../../../components/read-time";
import TypoForm from "../../../../components/typo-form";
import { getAllDraftPosts, getDraftPostBySlug } from "../../../../lib/api";

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
          <h1>Loading…</h1>
        ) : (
          <>
            <div className="mb-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <DateFormatter dateString={post.published_at} />
              <span className="text-xs text-gray-300 dark:text-gray-700">
                ●
              </span>
              <ReadTime content={post.body} />
            </div>
            <article className="prose dark:prose-invert">
              <h1>{post.title}</h1>

              <div className="mx-auto">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </article>

            <TypoForm post={post} />
          </>
        )}
      </Container>
    </Layout>
  );
}
type Params = {
  params: {
    slug: string;
    secret: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const post = await getDraftPostBySlug(params.slug, params.secret, [
    "title",
    "meta_description",
    "excerpt",
    "body",
    "published_at",
    "slug",
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
  const secretPath = process.env.SECRET_PREFIX;

  if (secretPath === undefined) {
    return {
      paths: [],
      fallback: false,
    };
  }

  const posts = await getAllDraftPosts(["slug"], secretPath);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          secret: secretPath,
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}

import Container from "../components/container";
import MoreStories from "../components/more-stories";
import HeroPost from "../components/hero-post";
import Intro from "../components/intro";
import Layout from "../components/layout";
import { getAllPosts } from "../lib/api";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";
import Post from "../interfaces/post";
import ArticleListItem from "../components/article-list-item";
import { useEffect } from "react";

type Props = {
  allPosts: Post[];
};

export default function Index({ allPosts }: Props) {
  const posts = allPosts.slice(0, 3);

  return (
    <>
      <Layout>
        <Head>
          <title>Tech, Development, and more | {CMS_NAME}</title>
        </Head>
        <Container>
          <h1 className="mt-8 text-4xl font-bold dark:text-gray-200">
            Latest Posts
          </h1>

          <div className="prose mt-6 dark:prose-invert">
            {posts.map((post) => (
              <ArticleListItem key={post.slug} post={post} />
            ))}
            {posts.map((post) => (
              <ArticleListItem key={post.slug} post={post} />
            ))}
          </div>

          {/* <Intro /> */}
          {/* {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.coverImage}
              date={heroPost.date}
              author={heroPost.author}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />} */}
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);

  return {
    props: { allPosts },
  };
};

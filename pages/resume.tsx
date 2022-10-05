import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPosts } from "../lib/api";
import Post from "../interfaces/post";

type Props = {
  allPosts: Post[];
};

export default function Index({ allPosts }: Props) {
  const posts = allPosts.slice(0, 3);

  return (
    <>
      <Layout
        pinned={true}
        navigationTitle="My Personal Resume"
        meta={{
          title: "Alfonso Bribiesca - Personal Resume",
          hidePageName: true,
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
        }}
      >
        <Container>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis
            maiores suscipit atque quam rem accusamus culpa soluta perspiciatis
            vero ad, rerum corporis eum fugiat obcaecati nesciunt quaerat,
            adipisci, ducimus dolor?
          </p>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const allPosts = await getAllPosts([
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

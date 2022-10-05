import Container from "../components/container";
import Layout from "../components/layout";

export default function Posts() {
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
          <h1 className="text-4xl font-bold dark:text-gray-200">Posts</h1>
        </Container>
      </Layout>
    </>
  );
}

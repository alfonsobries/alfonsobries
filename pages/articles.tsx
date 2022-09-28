import Container from "../components/container";
import Layout from "../components/layout";

export default function Articles() {
  return (
    <>
      <Layout
        meta={{
          title: "Articles",
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
          // path: ``,
          // ogType: "article",
        }}
      >
        <Container>
          <h1 className="text-4xl font-bold dark:text-gray-200">Articles</h1>
        </Container>
      </Layout>
    </>
  );
}

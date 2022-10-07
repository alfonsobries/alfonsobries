import Container from "../components/container";
import Layout from "../components/layout";

export default function Labs() {
  return (
    <>
      <Layout
        meta={{
          title: "Labs",
          description:
            "In this section, I want to share some of my personal projects and experiments that I made in addition to my daily job.",
          image: `https://og.alfonsobries.com/Personal%20Projects%20and%20Experiments`,
        }}
      >
        <Container>
          <h1 className="text-4xl font-bold dark:text-gray-200">Labs</h1>
        </Container>
      </Layout>
    </>
  );
}

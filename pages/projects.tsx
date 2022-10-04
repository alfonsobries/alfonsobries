import Container from "../components/container";
import Layout from "../components/layout";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";

export default function Projects() {
  return (
    <>
      <Layout
        meta={{
          title: "Projects",
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
        }}
      >
        <Container>
          <h1 className="text-4xl font-bold dark:text-gray-200">Projects</h1>
        </Container>
      </Layout>
    </>
  );
}

import Container from "../components/container";
import Layout from "../components/layout";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";

export default function About() {
  return (
    <>
      <Layout>
        <Head>
          <title>@TODO | {CMS_NAME}</title>
        </Head>
        <Container>
          <h1 className="font-bold text-4xl dark:text-gray-200">About</h1>
        </Container>
      </Layout>
    </>
  );
}

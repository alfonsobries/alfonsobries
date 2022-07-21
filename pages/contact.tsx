import Container from "../components/container";
import Layout from "../components/layout";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";

export default function Contact() {
  return (
    <>
      <Layout>
        <Head>
          <title>@TODO | {CMS_NAME}</title>
        </Head>
        <Container>
          <h1 className="text-4xl font-bold dark:text-gray-200">Contact</h1>
        </Container>
      </Layout>
    </>
  );
}

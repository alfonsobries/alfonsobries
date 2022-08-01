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
          <h1 className="text-4xl font-bold dark:text-gray-200">About</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor quod
            quae sequi nobis ex? Aspernatur cumque reiciendis doloribus quod
            eveniet quas amet voluptas laboriosam, impedit possimus, molestias
            qui incidunt harum.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae
            accusamus doloribus illo, reprehenderit, consequuntur ipsum optio
            voluptas non dicta unde, totam molestiae soluta voluptatem eveniet
            officia eligendi placeat beatae quae.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum,
            magni laboriosam doloremque corporis ipsam perspiciatis saepe,
            nesciunt nam porro beatae asperiores cumque in soluta unde
            laudantium vitae esse libero.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum,
            magni laboriosam doloremque corporis ipsam perspiciatis saepe,
            nesciunt nam porro beatae asperiores cumque in soluta unde
            laudantium vitae esse libero.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum,
            magni laboriosam doloremque corporis ipsam perspiciatis saepe,
            nesciunt nam porro beatae asperiores cumque in soluta unde
            laudantium vitae esse libero.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum,
            magni laboriosam doloremque corporis ipsam perspiciatis saepe,
            nesciunt nam porro beatae asperiores cumque in soluta unde
            laudantium vitae esse libero.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cum,
            magni laboriosam doloremque corporis ipsam perspiciatis saepe,
            nesciunt nam porro beatae asperiores cumque in soluta unde
            laudantium vitae esse libero.
          </p>
        </Container>
      </Layout>
    </>
  );
}

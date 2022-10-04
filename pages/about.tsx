import Container from "../components/container";
import Layout from "../components/layout";

export default function About() {
  return (
    <>
      <Layout
        meta={{
          title: "About me",
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
          // ogType: "article",
        }}
      >
        <Container>
          <div className="prose dark:prose-invert">
            <h1>About Me</h1>

            <p>
              Hi, my name is Alfonso I am a full-stack software developer from
              Mexico City.
            </p>

            <h2>Subtitle</h2>

            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Recusandae accusamus doloribus illo, reprehenderit, consequuntur
              ipsum optio voluptas non dicta unde, totam molestiae soluta
              voluptatem eveniet <a href="#">officia eligendi</a> placeat beatae
              quae.
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
          </div>
        </Container>
      </Layout>
    </>
  );
}

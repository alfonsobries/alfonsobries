import Container from "../components/container";
import Layout from "../components/layout";
import { Experience } from "../interfaces/experience";
import { getExperience } from "../lib/api";

type Props = {
  experience: Experience[];
};

export default function Index({ experience }: Props) {
  return (
    <>
      <Layout
        pinned={true}
        navigationTitle="My Personal Resume"
        useLightLogo
        hideFooter
        meta={{
          title: "Alfonso Bribiesca - Personal Resume",
          hidePageName: true,
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
        }}
      >
        <Container>
          {experience.map((item) => (
            <div key={item.id}>
              <h2>{item.title}</h2>
            </div>
          ))}
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const experience = await getExperience();

  return {
    props: { experience },
  };
};

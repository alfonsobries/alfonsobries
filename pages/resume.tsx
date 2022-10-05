import Container from "../components/container";
import Briefcase from "../components/icons/briefcase";
import Layout from "../components/layout";
import ResumeExperience from "../components/resume/experience";
import ResumeSection from "../components/resume/section";
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
        maxWidthClass="max-w-4xl"
        meta={{
          title: "Alfonso Bribiesca - Personal Resume",
          hidePageName: true,
          description: "@TODO: TBD",
          image: `https://og.alfonsobries.com/@TODO.png`,
        }}
      >
        <div className="relative z-0 mx-auto max-w-4xl px-4">
          <div className="md:w-3/5">
            <ResumeSection title="Experience" icon={<Briefcase />}>
              <div className="space-y-4">
                {experience.map((item) => (
                  <ResumeExperience {...item} key={item.id} />
                ))}
              </div>
            </ResumeSection>
          </div>
        </div>
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

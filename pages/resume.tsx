import Container from "../components/container";
import Briefcase from "../components/icons/briefcase";
import Code from "../components/icons/code";
import Layout from "../components/layout";
import ResumeExperience from "../components/resume/experience";
import ResumeProject from "../components/resume/project";
import ResumeSection from "../components/resume/section";
import { Experience } from "../interfaces/experience";
import { ResumeProject as ResumeProjectType } from "../interfaces/resume_project";
import { getExperience, getResumeProjects } from "../lib/api";

type Props = {
  experience: Experience[];
  projects: ResumeProjectType[];
};

export default function Index({ experience, projects }: Props) {
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
            <ResumeSection
              title="Open Source & Personal Projects"
              icon={<Code />}
            >
              <div className="space-y-4">
                {projects.map((item) => (
                  <ResumeProject {...item} key={item.id} />
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
  const [experience, projects] = await Promise.all([
    getExperience(),
    getResumeProjects(),
  ]);

  return {
    props: { experience, projects },
  };
};

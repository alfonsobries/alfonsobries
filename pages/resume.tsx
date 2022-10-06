import Briefcase from "../components/icons/briefcase";
import Code from "../components/icons/code";
import GraduationHat from "../components/icons/graduation-hat";
import Layout from "../components/layout";
import ResumeExperience from "../components/resume/experience";
import ResumeProject from "../components/resume/project";
import ResumeSection from "../components/resume/section";
import { Experience } from "../interfaces/experience";
import { ResumeProject as ResumeProjectType } from "../interfaces/resume_project";
import { getResumeData } from "../lib/api";

type Props = {
  work: Experience[];
  education: Experience[];
  projects: ResumeProjectType[];
};

export default function Index({ work, education, projects }: Props) {
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
          <div className="space-y-8 md:w-3/5">
            <ResumeSection title="Experience" icon={<Briefcase />}>
              <div className="space-y-4">
                {work.map((item) => (
                  <ResumeExperience {...item} key={item.id} />
                ))}
              </div>
            </ResumeSection>

            <ResumeSection
              title="Open Source &amp; Personal Projects"
              icon={<Code />}
            >
              <div className="space-y-4">
                {projects.map((item) => (
                  <ResumeProject {...item} key={item.id} />
                ))}
              </div>
            </ResumeSection>

            <ResumeSection title="Education" icon={<GraduationHat />}>
              <div className="space-y-4">
                {education.map((item) => (
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
  const { experience, projects } = await getResumeData();

  const work = experience.filter((item) => item.type === "work");
  const education = experience.filter((item) => item.type === "education");

  return {
    props: { projects, work, education },
  };
};

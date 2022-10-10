import Briefcase from "../components/icons/briefcase";
import Code from "../components/icons/code";
import GraduationHat from "../components/icons/graduation-hat";
import Knife from "../components/icons/knife";
import Contact from "../components/icons/contact";
import Twitter from "../components/icons/twitter";
import Github from "../components/icons/github";
import Linkedin from "../components/icons/linkedin";
import Layout from "../components/layout";
import ResumeContactItem from "../components/resume/contact-item";
import ResumeExperience from "../components/resume/experience";
import ResumeProject from "../components/resume/project";
import ResumeSection from "../components/resume/section";
import ResumeSkill from "../components/resume/skill";
import ResumeSkillGroup from "../components/resume/skill-group";
import ResumeSkillList from "../components/resume/skill-list";
import {
  ResumeExperience as ResumeExperienceType,
  ResumeProject as ResumeProjectType,
  ResumeSkill as ResumeSkillType,
} from "../interfaces/resume";
import { getResumeData } from "../lib/api";
import Envelop from "../components/icons/envelop";
import Dna from "../components/icons/dna";
import LineClamp from "../components/line-clamp";

type SkillGroup = {
  framework: ResumeSkillType[];
  language: ResumeSkillType[];
  other: ResumeSkillType[];
};

type Props = {
  work: ResumeExperienceType[];
  education: ResumeExperienceType[];
  projects: ResumeProjectType[];
  skillsExpert: SkillGroup;
  skillsAdvanced: SkillGroup;
};

const yearsOfExperience = (() => {
  const firstJobDate = new Date(2007, 7, 1);
  const today = new Date();
  const years = today.getFullYear() - firstJobDate.getFullYear();
  const months = today.getMonth() - firstJobDate.getMonth();
  if (
    months < 0 ||
    (months === 0 && today.getDate() < firstJobDate.getDate())
  ) {
    return years - 1;
  }
  return years;
})();

export default function Index({
  work,
  education,
  projects,
  skillsExpert,
  skillsAdvanced,
}: Props) {
  return (
    <>
      <Layout
        pinned={true}
        navigationTitle={
          <span className="prose inline-flex items-center space-x-2 font-sans font-normal dark:prose-invert">
            <strong>
              Alfonso <span className="hidden sm:inline">Bribiesca</span>
            </strong>{" "}
            <span className="text-sm text-gray-200 dark:text-gray-700">●</span>
            <span className="text-gray-500">Personal Resume</span>
          </span>
        }
        useLightLogo
        hideFooter
        maxWidthClass="max-w-4xl"
        meta={{
          title: "Alfonso Bribiesca - Personal Resume",
          hidePageName: true,
          description: `Alfonso Bribiesca is a full-stack developer with more than ${yearsOfExperience} years of experience building software for a wide variety of businesses around the world.`,
          image: `https://og.alfonsobries.com/Alfonso%20Bribiesca%20-%20Personal%20Resume.png`,
        }}
      >
        <div className="relative z-0 mx-auto flex max-w-4xl flex-col space-y-8 px-4 pb-8 sm:flex-row sm:space-x-8 sm:space-y-0">
          <div className="space-y-8 sm:max-w-sm md:max-w-md lg:max-w-lg">
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
          <div className="flex flex-1 flex-col-reverse sm:flex-col ">
            <ResumeSection
              className="mt-8 sm:mt-0 sm:mb-8"
              title="Contact Information"
              icon={<Contact />}
              noMargin
            >
              <ul className="space-y-2">
                <ResumeContactItem
                  icon={<Envelop />}
                  link="mailto:alfonso@vexilo.com"
                  external={false}
                >
                  alfonso@vexilo.com
                </ResumeContactItem>
                <ResumeContactItem
                  icon={<Twitter />}
                  link="https://twitter.com/alfonsobries"
                >
                  @alfonsobries
                </ResumeContactItem>
                <ResumeContactItem
                  icon={<Github />}
                  link="https://github.com/alfonsobries"
                >
                  @alfonsobries
                </ResumeContactItem>
                <ResumeContactItem
                  icon={<Linkedin />}
                  link="https://www.linkedin.com/in/alfonsobribiesca"
                >
                  /alfonsobribiesca
                </ResumeContactItem>
              </ul>
            </ResumeSection>
            <div className="space-y-8">
              <ResumeSection
                title="Skills &amp; Knowledge"
                icon={<Knife />}
                noMargin
              >
                <div className="space-y-8">
                  <ResumeSkillGroup
                    title="I am an expert in:"
                    intro="The following is a list of the different technologies where
                    I have a deep understanding of their inner workings, have
                    used them to solve real-world problems, and feel confident
                    in my ability to use them in a professional setting, either
                    leading a team or as an individual."
                  >
                    <ResumeSkillList title="Frameworks &amp; Tools">
                      {skillsExpert.framework.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>

                    <ResumeSkillList title="Programic Languages">
                      {skillsExpert.language.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>

                    <ResumeSkillList title="Other Techs &amp; Methodologies">
                      {skillsExpert.other.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>
                  </ResumeSkillGroup>

                  <ResumeSkillGroup
                    title="I have strong knowledge"
                    intro="I have worked with the following technologies over the last several years. However, I have only had a few opportunities to use them to their full potential. Still, I have a solid and extensive knowledge of them, and I am ready to use them on any production project that comes on my way."
                  >
                    <ResumeSkillList title="Frameworks &amp; Tools">
                      {skillsAdvanced.framework.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>

                    {/* <ResumeSkillList title="Programic Languages">
                    {skillsAdvanced.language.map((skill) => (
                      <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                    ))}
                  </ResumeSkillList> */}

                    <ResumeSkillList title="Techs &amp; Methodologies">
                      {skillsAdvanced.other.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>
                  </ResumeSkillGroup>
                </div>
              </ResumeSection>

              <ResumeSection title="About Me" icon={<Dna />} noMargin>
                <div className="prose text-sm dark:prose-invert">
                  <LineClamp>
                    <p className="line-clamp-6">
                      Hello, I’m Alfonso. For the past {yearsOfExperience}{" "}
                      years, I have been building and designing software for a
                      wide variety of businesses, either working in my company
                      In Mexico or, in recent years, working as a member of
                      different companies worldwide. My specialty is full-stack
                      architecture and development, and, as you can see in my
                      resume, I am proficient in several technologies.
                      <br />
                      <br />
                      In addition to software development I like good design and
                      illustration. I particullary enjoy memes and silly comic
                      strips as well. Other topics that interest me are
                      philosophy, psychology, and everything about the human
                      mind.
                      <br />
                      <br />
                      In my spare time, I enjoy traveling, reading a good book,
                      watching a good TV series, playing with my kids, and I
                      recently started training for triathlons.
                    </p>
                  </LineClamp>
                </div>
              </ResumeSection>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const { experience, projects, skills } = await getResumeData();

  const work = experience.filter((item) => item.type === "work");

  const education = experience.filter((item) => item.type === "education");

  const skillsExpert: SkillGroup = skills
    .filter((item) => item.level === "expert")
    .reduce(
      (acc, item) => {
        acc[item.category].push(item);
        return acc;
      },
      {
        framework: [],
        language: [],
        other: [],
      }
    );

  const skillsAdvanced: SkillGroup = skills
    .filter((item) => item.level === "advanced")
    .reduce(
      (acc, item) => {
        acc[item.category].push(item);
        return acc;
      },
      {
        framework: [],
        language: [],
        other: [],
      }
    );

  return {
    props: { projects, work, education, skillsExpert, skillsAdvanced },
  };
};

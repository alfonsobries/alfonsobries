import Briefcase from "../../components/icons/briefcase";
import Code from "../../components/icons/code";
import GraduationHat from "../../components/icons/graduation-hat";
import Knife from "../../components/icons/knife";
import Contact from "../../components/icons/contact";
import Twitter from "../../components/icons/twitter";
import Github from "../../components/icons/github";
import Linkedin from "../../components/icons/linkedin";
import ResumeContactItem from "../../components/resume/contact-item";
import ResumeExperience from "../../components/resume/experience";
import ResumeProject from "../../components/resume/project";
import ResumeSection from "../../components/resume/section";
import ResumeSkill from "../../components/resume/skill";
import ResumeSkillGroup from "../../components/resume/skill-group";
import ResumeSkillList from "../../components/resume/skill-list";
import {
  ResumeExperience as ResumeExperienceType,
  ResumeProject as ResumeProjectType,
  ResumeSkill as ResumeSkillType,
} from "../../interfaces/resume";
import { getResumeData } from "../../lib/api";
import Envelop from "../../components/icons/envelop";
import Dna from "../../components/icons/dna";
import PageBreak from "../../components/page-break";
import Link from "next/link";
import Sphere from "../../components/icons/sphere";

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
      <div
        id="header"
        className="mx-auto mb-4 flex max-w-4xl items-center px-4 pb-4"
      >
        <div className="flex flex-1 items-center space-x-2">
          <Link href="/">
            <a className="flex h-8 w-8 shrink-0 origin-bottom items-center justify-center rounded-full bg-blue-700 p-1">
              <img src="/images/face-icon-light.svg" alt="" />
            </a>
          </Link>

          <span className="prose flex items-center space-x-2 font-sans text-xl font-normal uppercase">
            <strong>Alfonso Bribiesca</strong>{" "}
            <span className="text-sm text-gray-200">●</span>
            <span className="uppercase text-gray-500">Personal Resume</span>
          </span>
        </div>

        <Link href="/resume">
          <a>
            <Sphere className="h-5 w-5 text-blue-700" />
          </a>
        </Link>
      </div>

      <div className="relative z-0 mx-auto flex max-w-4xl flex-row space-x-8 space-y-0 px-4 pb-8 pt-0">
        <div className="max-w-lg space-y-4">
          <ResumeSection title="Experience" icon={<Briefcase />}>
            <div className="space-y-4">
              {work
                .filter((item, index) => index < 4)
                .map((item) => (
                  <ResumeExperience {...item} key={item.id} />
                ))}
            </div>
          </ResumeSection>
        </div>
        <div className="flex flex-1 flex-col">
          <ResumeSection
            className="mt-0 mb-8"
            title="Contact Information"
            icon={<Contact />}
            noMargin
          >
            <ul className="space-y-2">
              <ResumeContactItem
                icon={<Sphere />}
                link="https://www.alfonsobries.com/"
                external={false}
              >
                alfonsobries.com
              </ResumeContactItem>
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

          <div className="space-y-4">
            <ResumeSection
              title="Skills &amp; Knowledge"
              icon={<Knife />}
              noMargin
            >
              <div className="space-y-4">
                <ResumeSkillGroup
                  className="break-after-all"
                  title="I am an expert in:"
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
              </div>
            </ResumeSection>
          </div>
        </div>
      </div>

      <PageBreak />

      <div className="relative z-0 mx-auto flex max-w-4xl flex-row space-x-8 space-y-0 px-4 pb-8 pt-0">
        <div className="max-w-lg space-y-4">
          <ResumeSection
            title="Open Source &amp; Personal Projects"
            icon={<Code />}
          >
            <div className="space-y-4">
              <div className="space-y-4">
                <>
                  {projects
                    .filter((item, index) => index < 3)
                    .map((item) => (
                      <ResumeProject {...item} key={item.id} />
                    ))}

                  <ResumeProject
                    id="other"
                    title="Visit my website"
                    url="https://www.alfonsobries.com/"
                    description='<p>Visit the <a href="https://www.alfonsobries.com" target="_blank" rel="nofollow">Labs</a> section on my personal website, the <a href="https://www.alfonsobries.com/resume" target="_blank" rel="nofollow">online version</a> of this resume or explore my <a href="https://github.com/alfonsobries" target="_blank" rel="nofollow">Github profile</a> to check some of my open-source tools, side-projects, and experiments.</p>'
                  />
                </>
              </div>
              {/* <ResumeProject
                id="other"
                title="Visit my website"
                url="https://www.alfonsobries.com/"
                description='<p>Visit the <a href="https://www.alfonsobries.com" target="_blank" rel="nofollow">Labs</a> section on my personal website, the <a href="https://www.alfonsobries.com/resume" target="_blank" rel="nofollow">online version</a> of this resume or explore my <a href="https://github.com/alfonsobries" target="_blank" rel="nofollow">Github profile</a> to check some of my open-source tools, side-projects, and experiments.</p>'
              /> */}
            </div>
          </ResumeSection>

          <ResumeSection title="Education" icon={<GraduationHat />}>
            <div className="space-y-4">
              <ResumeExperience {...education[0]} />

              <ResumeExperience
                id="test"
                title="Online Courses & Self Learning"
                period="Continual"
                place="Online"
                type="education"
                description='<p>During the last years, I have been taking online courses and reading books to keep my skills up to date. I have also been working on personal projects to learn new technologies and improve my skills. Visit the <a href="https://www.alfonsobries.com/resume" target="_blank" rel="nofollow">online version</a> of this resume for details.</p>'
              />
            </div>
          </ResumeSection>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="space-y-4">
            <ResumeSection noMargin>
              <ResumeSkillGroup title="I have strong knowledge">
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
            </ResumeSection>

            <ResumeSection title="About Me" icon={<Dna />} noMargin>
              <div className="prose text-sm">
                <p>
                  Hello, I’m Alfonso. For the past {yearsOfExperience} years, I
                  have been building and designing software for a wide variety
                  of businesses, either working in my company In Mexico or, in
                  recent years, working as a member of different companies
                  worldwide. My specialty is full-stack architecture and
                  development, and, as you can see in my resume, I am proficient
                  in several technologies.
                </p>
                <p>
                  In my spare time, I enjoy traveling, reading a good book,
                  watching a good TV series, playing with my kids, and I
                  recently started training for triathlons.
                </p>
              </div>
            </ResumeSection>
          </div>
        </div>
      </div>
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

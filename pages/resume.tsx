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
import { getGithubContributions, getResumeData } from "../lib/api";
import Envelop from "../components/icons/envelop";
import Dna from "../components/icons/dna";
import LineClamp from "../components/line-clamp";
import PageBreak from "../components/page-break";
import { BORDER_COLOR } from "../lib/cssClasses";
import FileDownload from "../components/icons/file-download";
import GithubHeatmap from "../components/github-heatmap";
import Keyboard from "../components/icons/keyboard";
import urls from "../helpers/urls";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

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
  githubContributions: {
    [key: number]: any[];
  };
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

export default function Resume({
  work,
  education,
  projects,
  skillsExpert,
  skillsAdvanced,
  githubContributions,
}: Props) {
  const { locale } = useRouter();

  const { t } = useTranslation();

  return (
    <>
      <Layout
        pinned={true}
        navigationTitle={
          <span className="prose inline-flex items-center space-x-2 font-sans font-normal dark:prose-invert">
            <strong>
              Alfonso{" "}
              <span className="hidden print:inline sm:inline">Bribiesca</span>
            </strong>{" "}
            <span className="text-sm text-gray-200 dark:text-gray-700">●</span>
            <span className="text-gray-500">
              {locale === "en" ? (
                <>
                  <span className="hidden print:inline sm:inline">
                    Personal
                  </span>{" "}
                  Resume
                </>
              ) : (
                <>Curriculum</>
              )}
            </span>
            <div className="flex items-center">
              <span
                className={`sm:border-l ${BORDER_COLOR}  ml-2 block h-5 sm:mr-4 sm:ml-2`}
              ></span>
              <a
                href="https://api.alfonsobries.com/api/resume/pdf"
                target="_blank"
                className="text-blue-700 hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-300"
                rel="noreferrer"
              >
                <FileDownload className="h-4 w-4" />
              </a>
            </div>
          </span>
        }
        useLightLogo
        hideFooter
        maxWidthClass="max-w-4xl"
        meta={{
          title: t("common:resume.meta_title"),
          hidePageName: true,
          description: t("common:resume.meta_description", {
            yearsOfExperience,
          }),
          image: `https://og.alfonsobries.com/${encodeURIComponent(
            t("common:resume.meta_title")
          )}.png`,
        }}
        hreflangUrl={urls.resume({
          locale: locale === "en" ? "es" : "en",
        })}
        t={t}
      >
        <div className="relative z-0 mx-auto flex max-w-4xl flex-col space-y-8 px-4 pb-8 print:flex-row print:space-x-8 print:space-y-0 print:pt-0 sm:flex-row sm:space-x-8 sm:space-y-0">
          <div className="space-y-8 print:max-w-md print:space-y-4 sm:max-w-sm md:max-w-md lg:max-w-lg">
            <ResumeSection
              title={t("common:resume.experience")}
              icon={<Briefcase />}
            >
              <div className="space-y-4">
                {work.map((item) => (
                  <ResumeExperience {...item} key={item.id} />
                ))}
              </div>
            </ResumeSection>

            <PageBreak />

            <ResumeSection
              title={t("common:resume.open_source")}
              icon={<Code />}
            >
              <div className="space-y-4">
                <>
                  {projects.map((item) => (
                    <ResumeProject
                      className="print:hidden"
                      {...item}
                      key={item.id}
                    />
                  ))}

                  <ResumeProject
                    className="hidden print:block"
                    id="other"
                    title="Visit my website"
                    url="https://www.alfonsobries.com/"
                    description='<p>Visit the <a href="https://www.alfonsobries.com" target="_blank" rel="nofollow">Labs</a> section on my personal website, the <a href="https://www.alfonsobries.com/resume" target="_blank" rel="nofollow">online version</a> of this resume or explore my <a href="https://github.com/alfonsobries" target="_blank" rel="nofollow">Github profile</a> to check some of my open-source tools, side-projects, and experiments.</p>'
                  />
                </>
              </div>
            </ResumeSection>

            <ResumeSection
              title={t("common:resume.education")}
              icon={<GraduationHat />}
            >
              <div className="space-y-4">
                {education.map((item, index) => (
                  <ResumeExperience
                    {...item}
                    key={item.id}
                    className={index > 0 && "print:hidden"}
                  />
                ))}

                <ResumeExperience
                  id="test"
                  className="hidden print:block"
                  title={t("common.resume.online_courses")}
                  period="Continual"
                  place="Online"
                  type="education"
                  description='<p>During the last years, I have been taking online courses and reading books to keep my skills up to date. I have also been working on personal projects to learn new technologies and improve my skills. Visit the <a href="https://www.alfonsobries.com/resume" target="_blank" rel="nofollow">online version</a> of this resume for details.</p>'
                />
              </div>
            </ResumeSection>
          </div>
          <div className="flex flex-1 flex-col-reverse print:flex-col sm:flex-col">
            <ResumeSection
              className="mt-8 print:mt-0 print:mb-8 sm:mt-0 sm:mb-8"
              title={t("common:resume.contact_information")}
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

            <div className="space-y-8 print:space-y-4">
              <ResumeSection
                title={t("common:resume.skills")}
                icon={<Knife />}
                noMargin
              >
                <div className="space-y-8 print:space-y-4">
                  <ResumeSkillGroup
                    className="break-after-all"
                    title={t("common:resume.im_an_expert")}
                    intro={t("common:resume.im_an_expert_intro")}
                  >
                    <ResumeSkillList title={t("common:resume.frameworks")}>
                      {skillsExpert.framework.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>

                    <ResumeSkillList
                      title={t("common:resume.programming_language")}
                    >
                      {skillsExpert.language.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>

                    <ResumeSkillList title={t("common:resume.other_techs")}>
                      {skillsExpert.other.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>
                  </ResumeSkillGroup>

                  <ResumeSkillGroup
                    title={t("common:resume.strong_knowledge")}
                    intro={t("common:resume.strong_knowledge_intro")}
                  >
                    <ResumeSkillList title={t("common:resume.frameworks")}>
                      {skillsAdvanced.framework.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>

                    {/* <ResumeSkillList title={t("common:resume.programming_language")}>
                    {skillsAdvanced.language.map((skill) => (
                      <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                    ))}
                  </ResumeSkillList> */}

                    <ResumeSkillList title={t("common:resume.other_techs")}>
                      {skillsAdvanced.other.map((skill) => (
                        <ResumeSkill key={skill.id}>{skill.name}</ResumeSkill>
                      ))}
                    </ResumeSkillList>
                  </ResumeSkillGroup>
                </div>
              </ResumeSection>

              <ResumeSection
                title={t("common:resume.latest_github")}
                icon={<Keyboard />}
                noMargin
              >
                <GithubHeatmap githubContributions={githubContributions} />
              </ResumeSection>
              <ResumeSection
                title={t("common:resume.about_me")}
                icon={<Dna />}
                noMargin
              >
                <div className="prose text-sm dark:prose-invert ">
                  <LineClamp>
                    <p className="line-clamp-6 print:line-clamp-none">
                      {locale === "en" ? (
                        <>
                          Hello, I’m Alfonso. For the past {yearsOfExperience}{" "}
                          years, I have been building and designing software for
                          a wide variety of businesses, either working in my
                          company In Mexico or, in recent years, working as a
                          member of different companies worldwide. My specialty
                          is full-stack architecture and development, and, as
                          you can see in my resume, I am proficient in several
                          technologies.
                          <br />
                          <br />
                          In my spare time, I enjoy traveling, reading a good
                          book, watching a good TV series, playing with my kids,
                          and I recently started training for triathlons.
                        </>
                      ) : (
                        <>
                          Hola, soy Alfonso. Durante los últimos{" "}
                          {yearsOfExperience} años, he estado construyendo y
                          diseñando software para una amplia variedad de
                          negocios, ya sea trabajando en mi empresa en México o,
                          en los últimos años, trabajando como miembro de
                          diferentes empresas en todo el mundo. Mi especialidad
                          es la arquitectura y desarrollo full-stack, y, como
                          puedes ver en mi currículum, tengo habilidades en
                          varias tecnologías.
                          <br />
                          <br />
                          En mi tiempo libre, disfruto viajar, leer un buen
                          libro, ver una buena serie de televisión, jugar con
                          mis hijos y recientemente comencé a entrenar para
                          triatlones.
                        </>
                      )}
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

export const getStaticProps = async ({ locale }) => {
  const [{ experience, projects, skills }, githubContributions] =
    await Promise.all([getResumeData(), getGithubContributions()]);

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
    props: {
      projects,
      work,
      education,
      skillsExpert,
      skillsAdvanced,
      githubContributions,
      ...(await serverSideTranslations(locale)),
    },
  };
};

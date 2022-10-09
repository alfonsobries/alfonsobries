import classNames from "classnames";
import Container from "../components/container";
import Sphere from "../components/icons/sphere";
import Layout from "../components/layout";
import ProjectTechnology from "../components/projects/technology";
import { getProjects } from "../lib/api";
import { BORDER_COLOR } from "../lib/cssClasses";

export default function Labs({ projects }) {
  return (
    <>
      <Layout
        meta={{
          title: "Labs",
          description:
            "In this section, I want to share some of the personal projects and experiments that I am doing in addition to my daily job",
          image: `https://og.alfonsobries.com/Personal%20Projects%20and%20Experiments`,
        }}
      >
        <Container>
          <div className="prose dark:prose-invert">
            <h1 className="text-4xl font-bold dark:text-gray-200">Labs</h1>
            <p>
              In this section you can find some personal side-projects and
              experiments that I am doing during my spare time.
            </p>
          </div>

          <div className="space-y-8">
            {projects.map((project) => (
              <div key={project.id} className="mt-8 space-y-4 ">
                <h2 className="text-2xl font-bold dark:text-gray-200">
                  <a className="hover:underline" href={project.url}>
                    {project.title}
                  </a>
                </h2>
                <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded bg-gray-200">
                  <span className="absolute h-full w-full animate-pulse bg-gray-200 dark:bg-gray-900"></span>
                  <a href={project.url}>
                    <img
                      src={project.banner_url}
                      srcSet={project.banner_url_2x + " 2x"}
                      alt={project.title + " banner"}
                    />
                  </a>
                </div>
                <div
                  className="prose text-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
                <div className="flex items-center justify-between space-x-4">
                  <a
                    href={project.url}
                    className="inline-flex items-center space-x-2 overflow-auto text-sm text-blue-500 dark:text-blue-400"
                  >
                    <Sphere className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.url}</span>
                  </a>

                  <ul className="flex items-center space-x-4">
                    {project.technologies.map((technology) => (
                      <li key={technology.id}>
                        <ProjectTechnology technology={technology} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div
            className={classNames(
              BORDER_COLOR,
              "mt-8 flex flex-col items-center space-y-2 border-t pt-8"
            )}
          >
            <span className="flex space-x-3">
              <img
                src="/images/tired.svg"
                alt="Alfonso Bribiesca"
                width={150}
                height={150}
              />
            </span>
          </div>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async () => {
  const projects = await getProjects();

  return {
    props: {
      projects,
    },
  };
};

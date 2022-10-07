import classNames from "classnames";
import Container from "../components/container";
import Laravel from "../components/icons/brands/laravel";
import React from "../components/icons/brands/react";
import Tailwindcss from "../components/icons/brands/tailwindcss";
import Sphere from "../components/icons/sphere";
import Layout from "../components/layout";
import { BORDER_COLOR } from "../lib/cssClasses";

export default function Labs() {
  const projects = [
    {
      id: 1,
      title: "Project 1",
      description: "This is a project",
      link: "https://google.com",
    },
    {
      id: 2,
      title: "Project 2",
      description: "This is a project",
      link: "https://google.com",
    },
    {
      id: 3,
      title: "Project 3",
      description: "This is a project",
      link: "https://google.com",
    },
  ];
  return (
    <>
      <Layout
        meta={{
          title: "Labs",
          description:
            "In this section, I want to share some of my personal projects and experiments that I made in addition to my daily job.",
          image: `https://og.alfonsobries.com/Personal%20Projects%20and%20Experiments`,
        }}
      >
        <Container>
          <h1 className="text-4xl font-bold dark:text-gray-200">Labs</h1>

          <div className="space-y-8">
            {projects.map((project) => (
              <div key={project.id} className="mt-8 space-y-4 ">
                <h2 className="text-2xl font-bold dark:text-gray-200">
                  {project.title}
                </h2>
                <div className="overflow-hidden rounded shadow">
                  <img src="https://picsum.photos/600/300" alt="" />
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Distinctio rem sit aut ut obcaecati totam quibusdam aliquam,
                  amet pariatur, fugiat quisquam voluptate. Facere nihil
                  possimus quam illo maxime veniam voluptas!
                </p>
                <div className="flex justify-between">
                  <a
                    href={project.link}
                    className="mt-2 inline-flex items-center space-x-2 text-sm text-blue-500 dark:text-blue-400"
                  >
                    <Sphere className="h-4 w-4" />
                    <span>{project.link}</span>
                  </a>

                  <ul className="flex space-x-4">
                    <li>
                      <Tailwindcss className="h-5 w-5 text-gray-400 hover:text-[#38b2ac]" />
                    </li>
                    <li>
                      <Laravel className="h-5 w-5 text-gray-400 hover:text-[#ff2d20]" />
                    </li>
                    <li>
                      <React className="h-5 w-5 text-gray-400 hover:text-[#61dafb]" />
                    </li>
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

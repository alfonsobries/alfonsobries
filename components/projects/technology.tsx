/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import type { ProjectType } from "../../interfaces/project";
import Laravel from "../icons/brands/laravel";
import Tailwindcss from "../icons/brands/tailwindcss";
import ReactIcon from "../icons/brands/react";
import Vue from "../icons/brands/vue";
import Bootstrap from "../icons/brands/bootstrap";

type Props = {
  technology: ProjectType;
};

const ProjectTechnology = ({ technology }: Props) => {
  if (technology === "laravel") {
    return <Laravel className="h-5 w-5 text-gray-400 hover:text-[#ff2d20]" />;
  }
  if (technology === "vue") {
    return <Vue className="h-5 w-5 text-gray-400 hover:text-[#4fc08d]" />;
  }
  if (technology === "react") {
    return <ReactIcon className="h-5 w-5 text-gray-400 hover:text-[#61dafb]" />;
  }
  if (technology === "tailwind") {
    return (
      <Tailwindcss className="h-5 w-5 text-gray-400 hover:text-[#38b2ac]" />
    );
  }
  if (technology === "bootstrap") {
    return <Bootstrap className="h-5 w-5 text-gray-400 hover:text-[#563d7c]" />;
  }

  return <></>;
};

export default ProjectTechnology;

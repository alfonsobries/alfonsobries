/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import type { ProjectType } from "../../interfaces/project";
import Laravel from "../icons/brands/laravel";
import Tailwindcss from "../icons/brands/tailwindcss";
import ReactIcon from "../icons/brands/react";
import Vue from "../icons/brands/vue";
import Bootstrap from "../icons/brands/bootstrap";
import Jest from "../icons/brands/jest";
import Redis from "../icons/brands/redis";
import Js from "../icons/brands/js";
import Pgsql from "../icons/brands/pgsql";
import Mysql from "../icons/brands/mysql";
import Php from "../icons/brands/php";
import Next from "../icons/brands/next";
import Ts from "../icons/brands/ts";
import Html from "../icons/brands/html";

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

  if (technology === "jest") {
    return <Jest className="h-5 w-5 text-gray-400 hover:text-[#c21325]" />;
  }

  if (technology === "redis") {
    return <Redis className="h-5 w-5 text-gray-400 hover:text-[#d82c20]" />;
  }

  if (technology === "js") {
    return <Js className="h-5 w-5 text-gray-400 hover:text-[#f7df1e]" />;
  }

  if (technology === "pgsql") {
    return <Pgsql className="h-5 w-5 text-gray-400 hover:text-[#336791]" />;
  }

  if (technology === "mysql") {
    return <Mysql className="h-5 w-5 text-gray-400 hover:text-[#4479a1]" />;
  }
  if (technology === "php") {
    return <Php className="h-5 w-5 text-gray-400 hover:text-[#777bb4]" />;
  }
  if (technology === "next") {
    return <Next className="h-5 w-5 text-gray-400 hover:text-[#000000]" />;
  }
  if (technology === "ts") {
    return <Ts className="h-5 w-5 text-gray-400 hover:text-[#007acc]" />;
  }
  if (technology === "html") {
    return <Html className="h-5 w-5 text-gray-400 hover:text-[#e34f26]" />;
  }

  return <></>;
};

export default ProjectTechnology;

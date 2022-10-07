export type ProjectType =
  | "laravel"
  | "vue"
  | "react"
  | "tailwind"
  | "jest"
  | "redis"
  | "js"
  | "pgsql"
  | "bootstrap"
  | "mysql"
  | "php"
  | "next"
  | "ts"
  | "html";

export type Project = {
  id: string;
  description: string;
  title: string;
  url: string;
  technologies: ProjectType[];
  banner_url: string;
  banner_url_2x: string;
};

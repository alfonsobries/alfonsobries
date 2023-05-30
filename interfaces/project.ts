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
  description: {
    en: string;
    es: string;
  };
  title: {
    en: string;
    es: string;
  };
  url: string;
  technologies: ProjectType[];
  banner_url: string;
  banner_url_2x: string;
};

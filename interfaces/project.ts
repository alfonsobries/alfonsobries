export type ProjectType =
  | "laravel"
  | "vue"
  | "react"
  | "tailwind"
  | "bootstrap";

export type Project = {
  id: string;
  description: string;
  title: string;
  url: string;
  technologies: ProjectType[];
  banner_url: string;
  banner_url_2x: string;
};

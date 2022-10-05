import axios from "axios";
import { Experience } from "../interfaces/experience";
import { ResumeProject } from "../interfaces/resume_project";
import { FilteredPost, Post, PostProperties } from "../interfaces/post";
import markdownToHtml from "./markdownToHtml";
export const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.com/api",
});

const getPostWithOnlyProperties = (
  post: Post,
  properties: PostProperties = []
): FilteredPost => {
  const newPost: FilteredPost = {};

  properties.forEach((property) => {
    newPost[property] = post[property];
  });

  return newPost;
};

export async function getPostBySlug(
  slug: string,
  properties: PostProperties = []
): Promise<FilteredPost> {
  const { data: post } = await Api.get(`/articles/${slug}`);

  return getPostWithOnlyProperties(post, properties);
}

export async function getAllPosts(properties: PostProperties = []) {
  const { data: posts } = await Api.get("/articles");

  return posts.map((post) => {
    return getPostWithOnlyProperties(post, properties);
  });
}

const parseExperience = async (experience: Experience) => {
  const formattedDescription = await markdownToHtml(experience.description);

  return {
    ...experience,
    description: formattedDescription,
  };
};
const parseResumeProject = async (project: ResumeProject) => {
  const formattedDescription = await markdownToHtml(project.description);

  return {
    ...project,
    description: formattedDescription,
  };
};

export async function getExperience() {
  const { data: experience }: { data: Experience[] } = await Api.get(
    "/resume/experience"
  );

  const result = await Promise.all(
    experience.map(async (exp) => {
      return parseExperience(exp);
    })
  );

  return result;
}

export async function getResumeProjects() {
  const { data: experience }: { data: ResumeProject[] } = await Api.get(
    "/resume/experience"
  );

  const result = await Promise.all(
    experience.map(async (exp) => {
      return parseResumeProject(exp);
    })
  );

  return result;
}

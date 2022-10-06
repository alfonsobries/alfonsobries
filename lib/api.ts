import axios from "axios";
import {
  ResumeProject,
  ResumeExperience,
  ResumeSkill,
} from "../interfaces/resume";
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

const parseExperience = async (experience: ResumeExperience) => {
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

export async function getResumeData() {
  const {
    data,
  }: {
    data: {
      experience: ResumeExperience[];
      projects: ResumeProject[];
      skills: ResumeSkill[];
    };
  } = await Api.get("/resume");

  const experience = await Promise.all(
    data.experience.map(async (item) => {
      return parseExperience(item);
    })
  );

  const projects = await Promise.all(
    data.projects.map(async (item) => {
      return parseResumeProject(item);
    })
  );

  const skills = data.skills;

  return { experience, projects, skills };
}

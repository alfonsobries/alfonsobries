import axios from "axios";
import markdownToHtml from "./markdownToHtml";
export const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.com/api",
});

export async function getPostBySlug(slug: string, fields: string[] = []) {
  const { data: post } = await Api.get(`/articles/${slug}`);

  const filteredPost = {};

  fields.forEach(async (field) => {
    if (typeof post[field] !== "undefined") {
      filteredPost[field] = post[field];
    } else {
      filteredPost[field] = null;
    }
  });

  return filteredPost;
}

export async function getAllPosts(fields: string[] = []) {
  const { data: posts } = await Api.get("/articles");

  const filteredPosts = [];

  posts.forEach((post) => {
    const filteredPost = {};

    fields.forEach(async (field) => {
      if (typeof post[field] !== "undefined") {
        filteredPost[field] = post[field];
      } else {
        filteredPost[field] = null;
      }
    });

    filteredPosts.push(filteredPost);
  });

  return filteredPosts;
}

export async function getExperience(fields: string[] = []) {
  const { data: posts } = await Api.get("/articles");

  return posts;
}

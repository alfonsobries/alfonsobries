import axios from "axios";

export const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.com/api",
});

export async function getPostBySlug(slug: string, fields: string[] = []) {
  const { data } = await Api.get(`/articles/${slug}`);

  return data;
}

export async function getAllPosts(fields: string[] = []) {
  const { data: posts } = await Api.get("/articles");

  return posts;
}

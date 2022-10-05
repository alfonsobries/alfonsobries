import axios from "axios";
import { FilteredPost, Post, PostProperties } from "../interfaces/post";
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

export async function getExperience() {
  const { data: experience } = await Api.get("/experience");

  console.log(experience);

  return experience;
}

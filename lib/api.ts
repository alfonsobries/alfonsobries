import { join } from "path";
import axios from "axios";

const postsDirectory = join(process.cwd(), "_posts");

export const Api = axios.create({
  baseURL: process.env.API_URL || "http://api.alfonsobries.test/api",
  headers: {
    // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

export async function getPostBySlug(slug: string, fields: string[] = []) {
  const { data } = await Api.get(`/articles/${slug}`);

  return data;

  //   const realSlug = slug.replace(/\.md$/, "");
  //   const fullPath = join(postsDirectory, `${realSlug}.md`);
  //   const fileContents = fs.readFileSync(fullPath, "utf8");
  //   const { data, content } = matter(fileContents);

  //   type Items = {
  //     [key: string]: string;
  //   };

  //   const items: Items = {};

  //   // Ensure only the minimal needed data is exposed
  //   fields.forEach((field) => {
  //     if (field === "slug") {
  //       items[field] = realSlug;
  //     }
  //     if (field === "content") {
  //       items[field] = content;
  //     }

  //     if (typeof data[field] !== "undefined") {
  //       items[field] = data[field];
  //     }
  //   });

  //   return items;
}

export async function getAllPosts(fields: string[] = []) {
  const { data: posts } = await Api.get("/articles");

  return posts;
}

import { LocaleCode } from "./localization";

export type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  meta_description: string;
  excerpt: string;
  // Make it date maybe?
  published_at: string;
  // coverImage?: string;
  slugs: Record<LocaleCode, string>;
};

export type PostProperties = Array<keyof Omit<Post, "slugs">>;

export type FilteredPost = {
  [key in keyof Post]?: Post[key];
};

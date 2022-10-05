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
};

export type PostProperties = (keyof Post)[];

export type FilteredPost = {
  [key in keyof Post]?: Post[key];
};

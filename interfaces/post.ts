import type Author from "./author";

type PostType = {
  slug: string;
  title: string;
  meta_description: string;
  date: string;
  coverImage: string;
  author: Author;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
};

export default PostType;

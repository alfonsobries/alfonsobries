import Posts, { POST_PER_PAGE, getStaticProps } from "../../[posts]";
import { Post } from "../../../interfaces/post";
import { Pagination as PaginationType } from "../../../interfaces/pagination";
import { getAllPosts } from "../../../lib/api";

export default Posts;

export { getStaticProps };

export async function getStaticPaths() {
  const pagination: PaginationType<Post> = await getAllPosts(
    [],
    {
      limit: 1,
    },
    "en"
  );

  const totalPages = Math.ceil(pagination.total / POST_PER_PAGE);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // I dont need the first page
  pages.shift();

  return {
    paths: pages.map((page) => {
      return {
        params: {
          page: page.toString(),
        },
      };
    }),
    fallback: false,
  };
}

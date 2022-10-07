import Link from "next/link";
import { Post } from "../interfaces/post";

const ArticleListItem: React.FC<{
  post: Post;
}> = ({ post }) => {
  return (
    <article>
      <h2 className="not-prose">
        <Link href={`/posts/${post.slug}`}>
          <a className="font-semibold text-gray-800 no-underline hover:underline dark:text-gray-200">
            {post.title}
          </a>
        </Link>
      </h2>

      <p>{post.excerpt}</p>

      <p>
        <Link href={`/posts/${post.slug}`}>
          <a className="text-blue-700 hover:text-blue-600 hover:underline dark:text-blue-500 dark:hover:text-blue-600">
            Read More →
          </a>
        </Link>
      </p>
    </article>
  );
};

export default ArticleListItem;

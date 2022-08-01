import Link from "next/link";
import Post from "../interfaces/post";

const ArticleListItem: React.FC<{
  post: Post;
}> = ({ post }) => {
  return (
    <article>
      <h2>
        <Link href={`/blog/${post.slug}`}>
          <a className="no-underline hover:underline">{post.title}</a>
        </Link>
      </h2>

      <p>{post.excerpt}</p>

      <p>
        <Link href={`/blog/${post.slug}`}>
          <a className="text-blue-700 hover:text-blue-600 hover:underline dark:text-blue-500 dark:hover:text-blue-600">
            Read more →
          </a>
        </Link>
      </p>
    </article>
  );
};

export default ArticleListItem;

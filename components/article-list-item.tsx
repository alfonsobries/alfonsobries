import classNames from "classnames";
import Link from "next/link";
import { Post } from "../interfaces/post";
import { LINK_COLOR_TEXT } from "../lib/cssClasses";

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
          <a className={classNames(LINK_COLOR_TEXT, "text-sm hover:underline")}>
            Read More →
          </a>
        </Link>
      </p>
    </article>
  );
};

export default ArticleListItem;

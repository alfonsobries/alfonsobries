import Post from "../interfaces/post";

const ArticleListItem: React.FC<{
  post: Post;
}> = ({ post }) => {
  return (
    <article>
      <h2>{post.title}</h2>

      <p>{post.excerpt}</p>

      <p>
        <a
          href="#"
          className="text-blue-700 hover:text-blue-600 hover:underline dark:text-blue-500 dark:hover:text-blue-600"
        >
          Read more →
        </a>
      </p>
    </article>
  );
};

export default ArticleListItem;

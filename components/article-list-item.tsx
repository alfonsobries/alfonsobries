import Post from "../interfaces/post";

const ArticleListItem: React.FC<{
  post: Post;
}> = ({ post }) => {
  return (
    <article>
      <h4>{post.title}</h4>

      <p className="">{post.excerpt}</p>

      <div>
        <a
          href="#"
          className="text-blue-700 hover:text-blue-600 hover:underline dark:text-blue-500 dark:hover:text-blue-600"
        >
          Read more →
        </a>
      </div>
    </article>
  );
};

export default ArticleListItem;

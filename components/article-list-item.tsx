import Post from "../interfaces/post";

const ArticleListItem: React.FC<{
  post: Post;
}> = ({ post }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg dark:text-gray-300">{post.title}</h3>

      <p className="text-gray-600 dark:text-gray-500 line-clamp-2 ">
        {post.excerpt}
      </p>

      <p>
        <a
          href="#"
          className="text-blue-700 hover:text-blue-600 hover:underline"
        >
          Read more →
        </a>
      </p>
    </div>
  );
};

export default ArticleListItem;

const ArticleListItem = () => {
  return (
    <div>
      <h3 className="font-semibold text-lg dark:text-gray-300">
        CSS Utility Classes and Separation of Concerns
      </h3>

      <p className="text-gray-600 dark:text-gray-500 ">
        Why “separation of concerns” is the wrong way to think about CSS and why
        presentational classes scale better than semantic classes.
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

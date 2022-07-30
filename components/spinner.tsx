const Spinner = () => {
  return (
    <svg
      className="spinner h-10 w-10 text-gray-100 dark:text-gray-800"
      viewBox="0 0 50 50"
    >
      <circle
        className="path"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeLinecap="round"
        stroke="currentColor"
        strokeWidth="5"
      ></circle>
    </svg>
  );
};

export default Spinner;

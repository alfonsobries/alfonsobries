import classNames from "classnames";

type Props = {
  className?: string;
};

const Home = ({ className }: Props) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={classNames(className)}
    >
      <path d="M16 8.5l-8-8-8 8 1.5 1.5 1.5-1.5v7.5h4v-3h2v3h4v-7.5l1.5 1.5 1.5-1.5zM12 15h-2v-3h-4v3h-2v-7.5l4-4 4 4v7.5z"></path>
    </svg>
  );
};

export default Home;

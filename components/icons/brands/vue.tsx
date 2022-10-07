import classNames from "classnames";

type Props = {
  className?: string;
};

// #4fc08d
const Vue = ({ className }: Props) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={classNames(className)}
    >
      <path
        fill="currentColor"
        d="M32 2.147h-13.253l-2.747 4.733-2.747-4.733h-13.253l16 27.707zM16 18.773l-9.12-15.8h5.907l3.213 5.573 3.213-5.573h5.907z"
      ></path>
    </svg>
  );
};

export default Vue;

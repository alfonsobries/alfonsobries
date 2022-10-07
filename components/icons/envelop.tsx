import classNames from "classnames";

type Props = {
  className?: string;
};

const Envelop = ({ className }: Props) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={classNames(className)}
    >
      <path d="M14.5 2h-13c-0.825 0-1.5 0.675-1.5 1.5v9c0 0.825 0.675 1.5 1.5 1.5h13c0.825 0 1.5-0.675 1.5-1.5v-9c0-0.825-0.675-1.5-1.5-1.5zM14 5l-6 4.5-6-4.5v-1l6 3 6-3v1z"></path>
    </svg>
  );
};

export default Envelop;

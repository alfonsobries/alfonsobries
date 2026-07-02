import classNames from "classnames";

type Props = {
  className?: string;
};

const Heart = ({ className }: Props) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={classNames(className)}
    >
      <path d="M11.75 1c-1.624 0-3.034 0.911-3.75 2.249-0.716-1.338-2.126-2.249-3.75-2.249-2.347 0-4.25 1.903-4.25 4.25 0 5.75 8 9.75 8 9.75s8-4 8-9.75c0-2.347-1.903-4.25-4.25-4.25z"></path>
    </svg>
  );
};

export default Heart;

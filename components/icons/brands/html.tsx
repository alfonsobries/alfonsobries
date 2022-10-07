import classNames from "classnames";

type Props = {
  className?: string;
};

// #e34f26
const Html = ({ className }: Props) => {
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
        d="M2 0h28l-2.547 28.751-11.484 3.249-11.419-3.251zM11.375 13l-0.309-3.624 13.412 0.004 0.307-3.496-17.568-0.004 0.931 10.68h12.168l-0.435 4.568-3.88 1.072-3.94-1.080-0.251-2.813h-3.479l0.44 5.561 7.229 1.933 7.172-1.924 0.992-10.876z"
      ></path>
    </svg>
  );
};

export default Html;

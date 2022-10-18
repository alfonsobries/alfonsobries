import classNames from "classnames";

type Props = {
  className?: string;
};

const FileDownload = ({ className }: Props) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={classNames(className)}
    >
      <path d="M13.341 3.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-6.75c-0.689 0-1.25 0.561-1.25 1.25v3.75l0.5 11 0.5-11v-3.75c0-0.135 0.115-0.25 0.25-0.25 0 0 6.749-0 6.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5l0.5 11 0.5-11c0-0.224-0.068-0.615-0.659-1.421zM10 4v-2.405c0.359 0.278 0.792 0.654 1.271 1.134s0.856 0.912 1.134 1.271h-2.406z"></path>
      <path d="M9 7h-3v5h-2.5l4 4 4-4h-2.5z"></path>
    </svg>
  );
};

export default FileDownload;

import classNames from "classnames";

const Spinner: React.FC<{
  size?: "sm";
}> = ({ size }) => {
  return (
    <svg
      className={classNames("spinner text-gray-100 dark:text-gray-800", {
        "h-10 w-10": size === undefined,
        "h-5 w-5": size === "sm",
      })}
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
        strokeWidth="3"
      ></circle>
    </svg>
  );
};

export default Spinner;

import classNames from "classnames";
import { cloneElement } from "react";
import { BORDER_COLOR } from "../../lib/cssClasses";

type Props = {
  className?: string;
  icon?: React.ReactElement;
  title?: string;
  children: React.ReactNode;
  noMargin?: boolean;
};

const ResumeSection = ({
  icon,
  title,
  children,
  noMargin = false,
  className,
}: Props) => {
  return (
    <div
      className={classNames(className, "flex flex-col space-y-4", {
        "ml-10": !noMargin,
      })}
    >
      {title && icon && (
        <div className="relative flex min-h-[2.5rem]">
          <div
            className={classNames("flex", {
              "absolute inset-0 -ml-9 h-full": !noMargin,
              "mr-3": noMargin,
            })}
          >
            {cloneElement(icon, {
              className: "w-6 h-6 text-gray-400 dark:text-gray-500 mt-2",
            })}
          </div>

          <h3
            className={classNames(
              "mb-0 flex flex-1 items-center border-b text-xl uppercase text-gray-800 dark:text-gray-200",
              BORDER_COLOR
            )}
          >
            <span>{title}</span>
          </h3>
        </div>
      )}

      <div>{children}</div>
    </div>
  );
};

export default ResumeSection;

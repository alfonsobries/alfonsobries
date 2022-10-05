import classNames from "classnames";
import { cloneElement } from "react";
import { BORDER_COLOR } from "../../lib/cssClasses";

type Props = {
  icon: React.ReactElement;
  title: string;
  children: React.ReactNode;
};

const ResumeSection = ({ icon, title, children }: Props) => {
  return (
    <div className="ml-10 flex flex-col space-y-4">
      <div className="relative flex min-h-[2.5rem]">
        <div className="absolute inset-0 -ml-9 flex h-full items-center">
          {cloneElement(icon, {
            className: "w-5 h-5 text-gray-400 dark:text-gray-500 ",
          })}
        </div>

        <h3
          className={classNames(
            "mb-0 flex  flex-1 items-center border-b text-xl uppercase  text-gray-800 dark:text-gray-200",
            BORDER_COLOR
          )}
        >
          <span>{title}</span>
        </h3>
      </div>

      <div>{children}</div>
    </div>
  );
};

export default ResumeSection;

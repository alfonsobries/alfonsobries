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
      <div className="relative flex items-center">
        <div>
          {cloneElement(icon, {
            className:
              "w-6 h-6 text-gray-400 dark:text-gray-500 absolute left-0 top-0 -ml-10 mt-1",
          })}
        </div>

        <div
          className={classNames("flex flex-1 flex-col border-b", BORDER_COLOR)}
        >
          <h3 className="text-lg uppercase leading-loose text-gray-800 dark:text-gray-200">
            {title}
          </h3>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
};

export default ResumeSection;

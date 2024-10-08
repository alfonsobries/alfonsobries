import classNames from "classnames";
import { ResumeExperience as ResumeExperienceType } from "../../interfaces/resume";

const ResumeExperience = ({
  title,
  period,
  place,
  description,
  className,
}: ResumeExperienceType & {
  className?: string;
}) => {
  return (
    <div className={classNames(className, "space-y-4")}>
      <div className="relative space-x-4 text-sm text-gray-400 before:absolute before:inset-0 before:-ml-8 before:block before:content-['●']">
        <span>{period}</span>

        {place && (
          <>
            <span className="text-xs text-gray-200 dark:text-gray-700">●</span>

            <span>{place}</span>
          </>
        )}
      </div>

      <div className="prose relative flex flex-col before:absolute before:inset-0 before:-ml-8 before:block before:h-full before:w-1 before:border-r before:border-gray-100 before:content-[''] dark:prose-invert dark:before:border-gray-800">
        <h4 className="mb-0 justify-start uppercase text-black dark:text-gray-200">
          {title}
        </h4>

        <div
          dangerouslySetInnerHTML={{ __html: description }}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default ResumeExperience;

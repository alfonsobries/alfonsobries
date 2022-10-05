import { Experience } from "../../interfaces/experience";
import Separator from "../separator";

const ResumeExperience = ({
  title,
  period,
  place,
  description,
}: Experience) => {
  return (
    <div className="space-y-5">
      <div className="relative flex items-center space-x-2 text-sm text-gray-400 before:absolute before:inset-0 before:-ml-8 before:block before:content-['●']">
        <span>{period}</span>

        <Separator />

        <span>{place}</span>
      </div>

      <div className="prose relative flex flex-col pt-3 before:absolute before:inset-0 before:-ml-8 before:block before:h-full before:w-1 before:border-r before:border-gray-100 before:content-[''] dark:prose-invert dark:before:border-gray-800">
        <h4 className="mb-0 justify-start uppercase text-black dark:text-gray-200">
          {title}
        </h4>

        <div dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
  );
};

export default ResumeExperience;

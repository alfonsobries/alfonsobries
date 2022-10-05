import { Experience } from "../../interfaces/experience";
import { ResumeProject } from "../../interfaces/resume_project";
import Separator from "../separator";

const ResumeProject = ({ title, description, url }: ResumeProject) => {
  return (
    <div className="space-y-5">
      <div className="prose relative flex flex-col pt-3 before:absolute before:inset-0 before:-ml-8 before:block before:h-full before:w-1 before:border-r before:border-gray-100 before:content-[''] dark:prose-invert dark:before:border-gray-800">
        <h4 className="mb-0 justify-start uppercase text-black dark:text-gray-200">
          {title}
        </h4>

        <div dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </div>
  );
};

export default ResumeProject;

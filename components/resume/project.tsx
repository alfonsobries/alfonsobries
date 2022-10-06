import { ResumeProject } from "../../interfaces/resume";
import LinkIcon from "../icons/link";

const ResumeProject = ({ title, description, url }: ResumeProject) => {
  return (
    <div className="space-y-4">
      <div className="prose relative flex flex-col before:absolute before:inset-0 before:-ml-8 before:block before:h-full before:w-1 before:border-r before:border-gray-100 before:content-[''] dark:prose-invert dark:before:border-gray-800">
        <h4 className="mb-0 justify-start uppercase text-black dark:text-gray-200">
          {title}
        </h4>

        <div
          dangerouslySetInnerHTML={{ __html: description }}
          className="text-sm"
        />

        <div className="relative flex items-center text-sm text-gray-400 ">
          <span className="absolute inset-0 -ml-11 -mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900">
            <LinkIcon className="h-4 w-4" />
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:text-blue-600 hover:underline dark:text-blue-500 dark:hover:text-blue-600"
          >
            {url}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResumeProject;

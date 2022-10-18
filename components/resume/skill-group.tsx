import classNames from "classnames";
import LineClamp from "../line-clamp";

type Props = {
  children: React.ReactNode;
  title: string;
  intro?: string;
  className?: string;
};

const ResumeSkillGroup = ({ children, title, intro, className }: Props) => {
  return (
    <div className={classNames("space-y-4", className)}>
      <h3 className="text-md font-semibold uppercase ">{title}</h3>

      {intro && (
        <LineClamp>
          <p className="text-sm text-gray-400 line-clamp-2">{intro}</p>
        </LineClamp>
      )}
      {children}
    </div>
  );
};

export default ResumeSkillGroup;

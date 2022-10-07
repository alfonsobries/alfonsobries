import LineClamp from "../line-clamp";

type Props = {
  children: React.ReactNode;
  title: string;
  intro: string;
};

const ResumeSkillGroup = ({ children, title, intro }: Props) => {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold uppercase ">{title}</h3>

      <LineClamp>
        <p className="text-sm text-gray-400 line-clamp-2">{intro}</p>
      </LineClamp>
      {children}
    </div>
  );
};

export default ResumeSkillGroup;

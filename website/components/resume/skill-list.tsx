type Props = {
  children: React.ReactNode;
  title: string;
};

const ResumeSkillList = ({ children, title }: Props) => {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
        {title}
      </h4>
      <ul>{children}</ul>
    </div>
  );
};

export default ResumeSkillList;

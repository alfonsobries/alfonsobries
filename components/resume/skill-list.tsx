type Props = {
  children: React.ReactNode;
  title: string;
};

const ResumeSkillList = ({ children, title }: Props) => {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-gray-400">{title}</h4>
      <ul>{children}</ul>
    </div>
  );
};

export default ResumeSkillList;

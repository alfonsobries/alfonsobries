import Check from "../icons/check";

type Props = {
  children: React.ReactNode;
};

const ResumeSkill = ({ children }: Props) => {
  return (
    <li className="prose flex items-center dark:prose-invert">
      <Check className="mr-2 h-3 w-3 text-gray-400 dark:text-gray-500" />
      <span>{children}</span>
    </li>
  );
};

export default ResumeSkill;

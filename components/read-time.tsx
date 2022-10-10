import classNames from "classnames";

type Props = {
  content: string;
  className?: string;
};

const WORDS_PER_MINUTE = 200;

const ReadTime = ({ content, className }: Props) => {
  const words = content.split(/\s/g).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return <span className={classNames(className)}>{minutes} min read</span>;
};

export default ReadTime;

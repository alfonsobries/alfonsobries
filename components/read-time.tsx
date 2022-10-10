type Props = {
  content: string;
};

const WORDS_PER_MINUTE = 200;

const ReadTime = ({ content }: Props) => {
  const words = content.split(/\s/g).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return <span>{minutes} min read</span>;
};

export default ReadTime;

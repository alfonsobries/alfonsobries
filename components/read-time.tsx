import classNames from "classnames";
import { TFunction } from "next-i18next";

type Props = {
  content: string;
  className?: string;
  t: TFunction;
};

const WORDS_PER_MINUTE = 200;

const ReadTime = ({ content, className, t }: Props) => {
  const words = content.split(/\s/g).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return (
    <span className={classNames(className)}>
      {t("common:read_time", { minutes })}
    </span>
  );
};

export default ReadTime;

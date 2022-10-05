import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";

type Props = {
  className?: string;
};

const Separator = ({ className }: Props) => {
  return (
    <span
      className={classNames(BORDER_COLOR, "block border-l", className)}
    ></span>
  );
};

export default Separator;

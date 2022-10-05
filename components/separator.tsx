import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";

const Separator = () => {
  return <span className={classNames(BORDER_COLOR, "block border-l")}></span>;
};

export default Separator;

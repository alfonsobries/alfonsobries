import classNames from "classnames";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => {
  return (
    <div className={classNames("max-w-xl mx-auto px-4", className)}>
      {children}
    </div>
  );
};

export default Container;

import classNames from "classnames";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => {
  return (
    <div className={classNames("mx-auto max-w-xl px-4", className)}>
      {children}
    </div>
  );
};

export default Container;

import classNames from "classnames";

type Props = {
  children?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
};

const Container = ({ children, className, noPadding = false }: Props) => {
  return (
    <div
      className={classNames("mx-auto max-w-xl", className, {
        "px-4": !noPadding,
      })}
    >
      {children}
    </div>
  );
};

export default Container;

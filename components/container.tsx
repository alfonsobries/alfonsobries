type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => {
  return (
    <div className={`max-w-xl mx-auto px-5${className ? ` ${className}` : ``}`}>
      {children}
    </div>
  );
};

export default Container;

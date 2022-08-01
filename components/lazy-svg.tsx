import { useMemo } from "react";
import { ReactSVG } from "react-svg";
import Spinner from "./spinner";

const LazySvg: React.FC<{
  src: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, width, height, className }) => {
  const beforeInjection = useMemo(() => {
    if (!height || !width) {
      return undefined;
    }

    return (svg) => {
      svg.style.height = `${height}px`;
      svg.style.width = `${width}px`;
    };
  }, [height, width]);

  return (
    <ReactSVG
      src={src}
      loading={() => <Spinner />}
      beforeInjection={beforeInjection}
      className={className}
    />
  );
};

export default LazySvg;

import { useMemo } from "react";
import { ReactSVG } from "react-svg";
import Spinner from "./spinner";

const LazySvg: React.FC<{
  showLoading?: boolean;
  src: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  svgClassName?: string;
  onReady?: (svg: SVGSVGElement) => void;
}> = ({
  src,
  width,
  height,
  className,
  svgClassName,
  onReady,
  showLoading = true,
}) => {
  const beforeInjection = useMemo(() => {
    return (svg: SVGSVGElement) => {
      if (height) {
        svg.style.height = typeof height === "number" ? `${height}px` : height;
      }
      if (width) {
        svg.style.width = typeof width === "number" ? `${width}px` : width;
      }
      if (svgClassName) {
        svg.classList.add(...svgClassName.split(" "));
      }
    };
  }, [height, width, svgClassName]);

  return (
    <ReactSVG
      src={src}
      loading={() => (showLoading ? <Spinner /> : null)}
      beforeInjection={beforeInjection}
      className={className}
      afterInjection={onReady}
    />
  );
};

export default LazySvg;

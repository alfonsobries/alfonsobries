import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import MousePointer from "./icons/mouse-pointer";
import LazySvg from "./lazy-svg";

const TIME_UNTIL_BUTTON_APPEARS_AFTER_SCROLLING = 1500;
const TIME_UNTIL_HIDE = 500;

const TypoForm = () => {
  const [init, setInit] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [hoveredTimeout, setHoveredTimeout] = useState(null);

  const elRef = useRef(null);

  const clickOutsideHandler = useCallback(() => {
    setActive(false);
    setHovered(false);
  }, []);

  useClickOutside({ ref: elRef, handler: clickOutsideHandler });

  const mouseEnterHandler = useCallback(() => {
    clearTimeout(hoveredTimeout);
    setHovered(true);
  }, [hoveredTimeout]);

  const mouseLeaveHandler = useCallback(() => {
    setHoveredTimeout(
      setTimeout(() => {
        setHovered(false);
      }, TIME_UNTIL_HIDE)
    );
  }, []);

  const clickHandler = useCallback(() => {
    setActive((prev) => !prev);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const scrollListener = () => {
      timeout = setTimeout(() => {
        setInit(true);
        window.removeEventListener("scroll", scrollListener);
      }, TIME_UNTIL_BUTTON_APPEARS_AFTER_SCROLLING);
    };

    window.addEventListener("scroll", scrollListener);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", scrollListener);
    };
  }, []);

  const shouldShow = useMemo(() => {
    return hovered || active;
  }, [hovered, active]);

  return (
    <button
      ref={elRef}
      type="button"
      onClick={clickHandler}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      className={classNames(
        "transform-opacity relative left-0 bottom-0 mt-8 flex cursor-pointer items-center space-x-2 transition-transform duration-200 ease-in-out md:fixed md:space-x-4 ",
        {
          "md:translate-y-12": init && !shouldShow,
          "md:translate-y-40": !init,
          "md:opacity-80": !shouldShow,
          "md:translate-y-2 md:opacity-100": init && shouldShow,
        }
      )}
    >
      <LazySvg src="/images/typo.svg" svgClassName="h-24 md:h-32" />

      <div
        className={classNames(
          "aspect-video -mt-14 bg-[url('/images/globe.svg')] bg-contain bg-center bg-no-repeat p-6 text-center text-black opacity-100 transition-opacity duration-200 ease-in-out md:-mt-20 md:p-8",
          {
            "md:opacity-0": !shouldShow,
            "md:opacity-100": shouldShow,
          }
        )}
      >
        <span id="message" className="font-cursive text-2xl leading-none">
          Something not
          <br />
          Clear?{" "}
          <span>
            <MousePointer className="-mt-1 ml-1 inline h-5 w-5" />
          </span>
        </span>
      </div>
    </button>
  );
};

export default TypoForm;

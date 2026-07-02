import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MousePointer from "./icons/mouse-pointer";
import LazySvg from "./lazy-svg";
import windowHasVerticalScroll from "../helpers/windowHasVerticalScroll";
import TypoFormForm from "./typo-form-form";
import { Post } from "../interfaces/post";

const TIME_UNTIL_BUTTON_APPEARS_AFTER_SCROLLING = 1500;
const TIME_UNTIL_HIDE = 500;

type Props = {
  post: Post;
};

const TypoForm = ({ post }: Props) => {
  const [init, setInit] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [hoveredTimeout, setHoveredTimeout] = useState(null);

  const elRef = useRef(null);

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

    const hasScroll = windowHasVerticalScroll();

    if (!hasScroll) {
      setInit(true);
      return;
    }

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

  const formErrorHandler = useCallback(() => {
    alert(
      "Something went wrong. Please try again later. (A meme is going to replace this alert soon)"
    );
  }, []);

  const formCancelHandler = useCallback(() => {
    setActive(false);
    setHovered(false);
  }, []);

  const buttonIsHidden = useMemo(() => {
    return !init || active;
  }, [active, init]);

  const buttonIsBarelyHidden = useMemo(() => {
    return !hovered && !buttonIsHidden;
  }, [hovered, buttonIsHidden]);

  const buttonIsVisible = useMemo(() => {
    return !buttonIsHidden && !buttonIsBarelyHidden;
  }, [buttonIsHidden, buttonIsBarelyHidden]);

  return (
    <div ref={elRef} className="flex w-full justify-center md:block">
      {active && (
        <TypoFormForm
          post={post}
          onCancel={formCancelHandler}
          onError={formErrorHandler}
        />
      )}

      <button
        type="button"
        onClick={clickHandler}
        onMouseEnter={mouseEnterHandler}
        onMouseLeave={mouseLeaveHandler}
        className={classNames(
          "transform-opacity relative left-0 bottom-0 z-10 mt-8 flex cursor-pointer items-center space-x-2 transition-transform duration-300 ease-in-out md:fixed md:space-x-4",
          {
            "md:translate-y-40": buttonIsHidden,
            "md:translate-y-12 md:opacity-80": buttonIsBarelyHidden,
            "md:translate-y-2 md:opacity-100": buttonIsVisible,
          }
        )}
      >
        <LazySvg src="/images/typo.svg" svgClassName="h-24 md:h-32 w-auto" />

        <div
          className={classNames(
            "aspect-video -mt-14 bg-[url('/images/globe.svg')] bg-contain bg-center bg-no-repeat p-6 text-center text-black opacity-100 transition-opacity duration-200 ease-in-out md:-mt-20 md:p-8",
            {
              "md:opacity-0": !buttonIsVisible,
              "md:opacity-100": buttonIsVisible,
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
    </div>
  );
};

export default TypoForm;

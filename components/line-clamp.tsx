import { cloneElement, useRef, Children, useState, useCallback } from "react";
import { useEffect } from "react";
import { LINK_COLOR_TEXT } from "../lib/cssClasses";

type Props = {
  children: React.ReactElement;
};

const MORE_LABEL = "[More...]";
const LESS_LABEL = "[...Less]";
let lineClampClasses: string[] = [];

const readMoreHandler = (event) => {
  const button = event.target as HTMLButtonElement;
  const wrapper = button.parentElement as HTMLElement;
  button.innerHTML = LESS_LABEL;
  button.classList.remove("absolute");
  button.classList.add("relative", "before:hidden", "bg-transparent");

  lineClampClasses = Array.from(wrapper.classList).filter((cl) =>
    cl.includes("line-clamp")
  );

  lineClampClasses.forEach((cl) => wrapper.classList.remove(cl));

  button.removeEventListener("click", readMoreHandler);
  button.addEventListener("click", readLessHandler);
};

const readLessHandler = (event) => {
  const button = event.target as HTMLButtonElement;
  const wrapper = button.parentElement as HTMLElement;

  button.innerHTML = MORE_LABEL;
  button.classList.add("absolute");
  button.classList.remove("relative", "before:hidden", "bg-transparent");

  lineClampClasses.forEach((cl) => wrapper.classList.add(cl));

  button.removeEventListener("click", readLessHandler);
  button.addEventListener("click", readMoreHandler);
};

const LineClamp = ({ children }: Props) => {
  const elRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = elRef.current;
    const isCurrentyClamped = el.scrollHeight > el.clientHeight;

    if (isCurrentyClamped && el.querySelector("button") === null) {
      const readMoreButton = document.createElement("button");
      readMoreButton.type = "button";
      readMoreButton.className = `${LINK_COLOR_TEXT} text-sm absolute bottom-0 right-0 before:absolute before:-ml-6 before:block before:h-full before:w-6 before:inset-0 before:bg-gradient-to-r before:from-transparent before:to-white dark:before:to-gray-900 before:content-[''] bg-white dark:bg-gray-900 block inline pl-1`;
      readMoreButton.innerHTML = MORE_LABEL;
      readMoreButton.addEventListener("click", readMoreHandler);
      el.classList.add("relative");
      el.appendChild(readMoreButton);
    }
  }, []);

  return <>{cloneElement(children, { ref: elRef })}</>;
};

export default LineClamp;

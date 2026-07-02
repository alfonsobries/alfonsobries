import classNames from "classnames";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import LazySvg from "./lazy-svg";

const SwitchButton: React.FC<{
  className?: string;
  icon?: boolean;
}> = ({ className, icon = false }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [setTheme, resolvedTheme]);

  if (!icon) {
    return (
      <button type="button" onClick={toggleTheme} className={className}>
        <LazySvg src="/images/switch.svg" />
        <span className="sr-only">Switch Dark Mode</span>
      </button>
    );
  }

  if (!isMounted) {
    return null;
  }

  return (
    <button type="button" onClick={toggleTheme} className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={classNames("h-5 w-5", {
          hidden: resolvedTheme === "light",
        })}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={classNames("h-5 w-5", {
          hidden: resolvedTheme === "dark",
        })}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      <span className="sr-only">Switch Dark Mode</span>
    </button>
  );
};

export default SwitchButton;

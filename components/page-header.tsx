import Container from "./container";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";
import { useTheme } from "next-themes";

const PageHeader = () => {
  const { theme, setTheme } = useTheme();

  const toggleDarkMode = (e: any) => {
    e.preventDefault();

    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };
  const useSmall = false;

  return (
    <div className="z-50 mb-4">
      <Container noPadding>
        <div
          className={classNames(BORDER_COLOR, "px-4", {
            "py-4": !useSmall,
            "py-3": useSmall,
          })}
        >
          <div
            className={classNames(
              "relative flex sm:flex-row  sm:justify-center sm:border-b",
              {
                "flex-col items-center space-y-4 sm:flex-row sm:items-end sm:space-y-0 sm:space-x-8  ":
                  !useSmall,
                "flex-row-reverse items-end justify-between": useSmall,
              }
            )}
          >
            <button
              type="button"
              onClick={toggleDarkMode}
              className={classNames({
                "absolute right-0 top-0 -mt-2 w-12 p-1": !useSmall,
                "w-6": useSmall,
              })}
            >
              <img
                src={
                  theme === "dark"
                    ? "/images/switch-off.svg"
                    : "/images/switch-on.svg"
                }
                alt="Tooggle Dark Mode"
              />
            </button>

            <div className="h-[171px] w-[130px] flex-shrink-0">
              <img
                src="/images/me.svg"
                alt="Alfonso Bribiesca"
                className="h-auto w-full dark:hidden"
              />

              <img
                src="/images/me-dark.svg"
                alt="Alfonso Bribiesca"
                className="-mt-[10px] hidden h-auto w-full dark:block"
              />
            </div>

            {!useSmall && (
              <div className="w-full sm:w-auto sm:flex-grow sm:space-y-4">
                <p className="text-center font-cursive text-6xl font-bold text-gray-900 dark:text-gray-300 sm:text-left">
                  Hello, I’m{" "}
                  <span className="relative after:absolute after:left-0 after:-mt-[15px] after:-ml-[5%] after:block after:h-3 after:w-[110%] after:bg-[#fbd68b] after:opacity-50 after:content-['']">
                    Alfonso
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PageHeader;

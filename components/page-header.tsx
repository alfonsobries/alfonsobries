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

  return (
    <div className="z-50 mb-4">
      <Container noPadding>
        <div className={classNames(BORDER_COLOR, "px-4 py-4")}>
          <div className="relative flex flex-col  items-center space-y-4 sm:flex-row sm:items-end sm:justify-center sm:space-y-0 sm:space-x-8 sm:border-b">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="absolute right-0 top-0  w-10 p-1"
            >
              {theme === "dark" ? (
                <img src="/images/switch-off.svg" alt="Disable Dark Mode" />
              ) : (
                <img src="/images/switch-on.svg" alt="Enable Dark Mode" />
              )}
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

            <div className="w-full sm:w-auto sm:flex-grow sm:space-y-4">
              <p className="text-center font-cursive text-6xl font-bold text-gray-900 dark:text-gray-300 sm:text-left">
                Hello, I’m{" "}
                <span className="relative after:absolute after:left-0 after:-mt-[15px] after:-ml-[5%] after:block after:h-3 after:w-[110%] after:bg-[#fbd68b] after:opacity-50 after:content-['']">
                  Alfonso
                </span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PageHeader;

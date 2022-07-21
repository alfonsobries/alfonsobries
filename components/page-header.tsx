import Image from "next/future/image";
import imageMe from "../public/images/me.svg";
import imageMeDark from "../public/images/me-dark.svg";
import imageSwitchOn from "../public/images/switch-on.svg";
import imageSwitchOff from "../public/images/switch-off.svg";
import Container from "./container";
import MainMenu from "./main-menu";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";
import { useEffect, useState } from "react";

const PageHeader: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = (e: any) => {
    e.preventDefault();

    if (isDark) {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  };

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <Container>
      <div
        className={classNames(
          BORDER_COLOR,
          "relative flex flex-col items-center space-y-4 pb-8 sm:mb-8 sm:flex-row sm:items-end sm:justify-center sm:space-x-8 sm:space-y-0 sm:border-b"
        )}
      >
        <button
          type="button"
          onClick={toggleDarkMode}
          className="absolute right-0 top-0 -mt-2 w-12 p-1"
        >
          <Image
            src={isDark ? imageSwitchOff : imageSwitchOn}
            alt="Tooggle Dark Mode"
          />
        </button>

        <div className="h-[171px] w-[130px] flex-shrink-0">
          {children || (
            <>
              <Image
                src={imageMe}
                alt="Alfonso Bribiesca"
                width={130}
                height={171}
                className="dark:hidden"
              />

              <Image
                src={imageMeDark}
                alt="Alfonso Bribiesca"
                width={130}
                height={171}
                className="-mt-[10px] hidden dark:block"
              />
            </>
          )}
        </div>
        <div className="w-full sm:w-auto sm:flex-grow sm:space-y-4">
          <p className="text-center font-cursive text-6xl font-bold text-gray-900 dark:text-gray-300 sm:text-left">
            Hello, I’m{" "}
            <span className="relative after:absolute after:left-0 after:-mt-[15px] after:-ml-[5%] after:block after:h-3 after:w-[110%] after:bg-[#fbd68b] after:opacity-50 after:content-['']">
              Alfonso
            </span>
          </p>

          <MainMenu />
        </div>
      </div>
    </Container>
  );
};

export default PageHeader;

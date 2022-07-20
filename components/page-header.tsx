import Image from "next/future/image";
import imageMe from "../public/images/me.svg";
import imageMeDark from "../public/images/me-dark.svg";
import Container from "./container";
import MainMenu from "./main-menu";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";
const PageHeader: React.FC<{
  small?: boolean;
  children?: React.ReactNode;
}> = ({ small = false, children }) => {
  const toggleDarkMode = (e: any) => {
    e.preventDefault();
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  };

  return (
    <Container>
      <button
        type="button"
        onClick={toggleDarkMode}
        className="p-3 roudned bg-black text-white fixed left-0 top-0 m-4"
      >
        Toggle Dark mode
      </button>
      <div
        className={classNames(
          BORDER_COLOR,
          "flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0 items-center sm:items-end sm:justify-center sm:border-b sm:mb-8 pb-8"
        )}
      >
        <div className="flex-shrink-0 w-[130px] h-[171px]">
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
                className="hidden dark:block -mt-[10px]"
              />
            </>
          )}
        </div>
        <div className="sm:space-y-4 sm:flex-grow w-full sm:w-auto">
          <p className="text-6xl font-bold font-cursive text-gray-900 dark:text-gray-300 text-center sm:text-left">
            Hello, I’m{" "}
            <span className="relative after:content-[''] after:block after:absolute after:-mt-[15px] after:-ml-[5%] after:left-0 after:w-[110%] after:h-3 after:bg-[#fbd68b] after:opacity-50">
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

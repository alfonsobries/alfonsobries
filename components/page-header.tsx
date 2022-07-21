import Image from "next/future/image";
import imageMe from "../public/images/me.svg";
import imageMeDark from "../public/images/me-dark.svg";
import imageSwitch from "../public/images/switch.svg";
import Container from "./container";
import MainMenu from "./main-menu";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";

const PageHeader: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
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
        className="roudned fixed right-0 top-0 m-4 dark:rotate-180 "
      >
        <Image src={imageSwitch} alt="Tooggle Dark Mode" width={30} />
      </button>

      <div
        className={classNames(
          BORDER_COLOR,
          "flex flex-col items-center space-y-4 pb-8 sm:mb-8 sm:flex-row sm:items-end sm:justify-center sm:space-x-8 sm:space-y-0 sm:border-b"
        )}
      >
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

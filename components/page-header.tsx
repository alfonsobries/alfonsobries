import Container from "./container";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";
import SwitchButton from "./SwitchButton";
import { ReactSVG } from "react-svg";

const PageHeader = () => {
  return (
    <div className={classNames(BORDER_COLOR, " pb-4")}>
      <Container noPadding>
        <div className={classNames(BORDER_COLOR, "px-4 py-4")}>
          <div className="relative flex flex-col items-center sm:flex-row sm:items-end sm:justify-center">
            <SwitchButton className="absolute right-0 top-0 w-10 p-1" />

            <ReactSVG
              src="/images/me-full.svg"
              loading={() => (
                <svg
                  className="spinner h-10 w-10 text-gray-100 dark:text-gray-800"
                  viewBox="0 0 50 50"
                >
                  <circle
                    className="path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeLinecap="round"
                    stroke="currentColor"
                    strokeWidth="5"
                  ></circle>
                </svg>
              )}
              beforeInjection={(svg) => {
                svg.style.height = "180px";
                svg.style.width = "130px";
              }}
              className="flex h-[180px] w-[130px] items-center justify-center"
            />

            <div className="mt-4 w-full sm:ml-4 sm:mt-0 sm:w-auto sm:flex-grow sm:space-y-4">
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

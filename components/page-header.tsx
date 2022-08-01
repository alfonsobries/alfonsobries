import Container from "./container";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";
import SwitchButton from "./SwitchButton";
import { ReactSVG } from "react-svg";
import Spinner from "./spinner";

const PageHeader = () => {
  return (
    <div className={classNames(BORDER_COLOR, " pb-4")}>
      <Container noPadding>
        <div className={classNames(BORDER_COLOR, "px-4 py-4")}>
          <div className="relative flex flex-col items-center sm:flex-row sm:items-end sm:justify-center">
            <SwitchButton className="absolute right-0 top-0 flex w-10 items-center justify-center p-1" />

            <ReactSVG
              src="/images/me.svg"
              loading={() => <Spinner />}
              beforeInjection={(svg) => {
                svg.style.height = "180px";
                svg.style.width = "130px";
              }}
              className="flex h-[180px] w-[130px] items-center justify-center"
            />

            <div className="mt-4 w-full sm:ml-4 sm:mt-0 sm:w-auto sm:flex-grow sm:space-y-4">
              <p className="overflow-hidden whitespace-nowrap text-center font-cursive text-6xl font-bold text-gray-900 dark:text-gray-300 sm:text-left">
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

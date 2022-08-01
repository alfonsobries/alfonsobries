import Container from "./container";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";
import Twitter from "./icons/twitter";
import Github from "./icons/github";

const Footer = () => {
  return (
    <footer className="text-xs text-gray-400 dark:text-gray-500 ">
      <Container>
        <div
          className={classNames(
            BORDER_COLOR,
            "mt-8 flex flex-col space-y-4 border-t pt-8"
          )}
        >
          <div className="mb-2 flex justify-center space-x-4">
            <a
              href="https://github.com/alfonsobries"
              target="_blank"
              className="text-blue-700 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-600"
              rel="noreferrer"
            >
              <Github />
            </a>

            <a
              href="https://twitter.com/alfonsobries"
              target="_blank"
              className="text-blue-700 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-600"
              rel="noreferrer"
            >
              <Twitter />
            </a>
          </div>

          <div className="flex flex-col items-center space-y-2 pb-8 text-center">
            <span>Idea, illustrations, design and development by</span>
            <span className="flex space-x-3">
              <img
                src="/images/this-guy.svg"
                alt="Alfonso Bribiesca"
                width={35}
              />

              <span className="mt-2 font-cursive text-2xl text-gray-900 dark:text-gray-200">
                this guy
              </span>
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

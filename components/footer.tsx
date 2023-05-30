import Container from "./container";
import classNames from "classnames";
import { BORDER_COLOR, LINK_COLOR_TEXT } from "../lib/cssClasses";
import Twitter from "./icons/twitter";
import Github from "./icons/github";
import LazySvg from "./lazy-svg";
import Heart from "./icons/heart";
import { useMemo } from "react";
import urls from "../helpers/urls";
import { useRouter } from "next/router";
import { LocaleCode } from "../interfaces/localization";
import Link from "next/link";

const Footer = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const { locale } = useRouter();
  return (
    <footer className="text-sm text-gray-500">
      <Container>
        <div
          className={classNames(
            BORDER_COLOR,
            "mt-8 flex flex-col space-y-4 border-t py-8 "
          )}
        >
          <div className="mb-2 flex items-center justify-between space-x-4">
            <span className="inline-flex items-center space-x-2">
              <span className="inline-flex items-center space-x-2">
                <span>{year} © </span>
                <LazySvg
                  src="/images/face-icon-light.svg"
                  showLoading={false}
                  width={20}
                  height={20}
                />
              </span>

              <span className="text-xs text-gray-300 dark:text-gray-700">
                ●
              </span>

              <span className="inline-flex items-center space-x-2">
                <span>Made with</span>
                <span>
                  <Heart className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                  <span className="sr-only">Love</span>
                </span>
              </span>

              <span className="text-xs text-gray-300 dark:text-gray-700">
                ●
              </span>

              <Link href={urls.about({ locale } as { locale: LocaleCode })}>
                <a
                  className={
                    "text-gray-900  hover:text-gray-800 hover:underline dark:text-gray-300 dark:hover:text-gray-200"
                  }
                  rel="noreferrer"
                >
                  About Me
                </a>
              </Link>
            </span>
            <span className={classNames(BORDER_COLOR, "border-l")}></span>
            <div className="flex space-x-4">
              <a
                href="https://github.com/alfonsobries"
                target="_blank"
                className={classNames(LINK_COLOR_TEXT)}
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">Github: /alfonsobries</span>
              </a>

              <a
                href="https://twitter.com/alfonsobries"
                target="_blank"
                className={classNames(LINK_COLOR_TEXT)}
                rel="noreferrer"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter: @alfonsobries</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

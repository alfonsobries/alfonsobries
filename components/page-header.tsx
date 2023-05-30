import Container from "./container";
import classNames from "classnames";
import { BORDER_COLOR } from "../lib/cssClasses";
import SwitchButton from "./switch-button";
import LazySvg from "./lazy-svg";
import Link from "next/link";
import { TFunction } from "next-i18next";

const PageHeader: React.FC<{
  small?: boolean;
  pinned?: boolean;
  t: TFunction;
}> = ({ small = false, pinned = false, t }) => {
  if (pinned) {
    return <></>;
  }

  return (
    <div
      className={classNames(BORDER_COLOR, {
        "pb-4": !small,
      })}
    >
      <Container noPadding>
        <div className={classNames(BORDER_COLOR, "px-4 py-4")}>
          <div
            className={classNames(
              "relative flex items-center sm:items-end sm:justify-center",
              {
                "flex-col sm:flex-row": !small,
                "flex-row": small,
              }
            )}
          >
            {small ? (
              <Link href="/">
                <a className="flex w-full items-center space-x-4">
                  <LazySvg
                    src="/images/me-face.svg"
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-700 p-1 dark:bg-blue-200"
                  />

                  <span className="font-cursive text-4xl font-bold text-gray-900 dark:text-gray-300 ">
                    {t("common:site_title")}
                  </span>
                </a>
              </Link>
            ) : (
              <>
                <LazySvg
                  src="/images/me.svg"
                  width={110}
                  height={150}
                  className="flex h-[150px] w-[130px] flex-shrink-0 items-center justify-center"
                />

                <div className="mt-4 w-full sm:ml-4 sm:mt-0 sm:w-auto sm:flex-grow sm:space-y-4">
                  <p className="whitespace-nowrap text-center font-cursive text-6xl font-bold text-gray-900 dark:text-gray-300 sm:text-left">
                    {t("common:hello_im")}{" "}
                    <span className="relative after:absolute after:left-0 after:-mt-[15px] after:-ml-[5%] after:block after:h-3 after:w-[110%] after:bg-[#fbd68b] after:opacity-50 after:content-['']">
                      Alfonso
                    </span>
                  </p>
                </div>
              </>
            )}

            <SwitchButton
              className={classNames(
                " flex w-10 items-center justify-center p-1",
                {
                  "absolute right-0 top-0": !small,
                }
              )}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PageHeader;

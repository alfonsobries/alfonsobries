import Image from "next/future/image";
import Link from "next/link";
import cn from "classnames";
import { useRouter } from "next/router";
import { BORDER_COLOR } from "../lib/cssClasses";
import { useCallback, useEffect, useState } from "react";
import imageMeFace from "../public/images/face-icon.svg";
import imageMeFaceDark from "../public/images/face-icon-dark.svg";

const links = [
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/articles",
    label: "Articles",
  },
  {
    href: "/projects",
    label: "Projects",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

const MainMenu = () => {
  const router = useRouter();

  const [isSticky, setIsSticky] = useState(false);

  const scrollListener = useCallback(() => {
    const nav = document.querySelector("nav")!;

    const { top } = nav.getBoundingClientRect();

    if (isSticky && top > 0) {
      setIsSticky(false);
      return;
    }

    if (!isSticky && top === 0) {
      setIsSticky(true);
    }
  }, [isSticky, setIsSticky]);

  useEffect(() => {
    scrollListener();

    window.addEventListener("scroll", scrollListener);

    return () => {
      window.removeEventListener("scroll", scrollListener);
    };
  }, []);

  return (
    <nav
      className={cn(
        BORDER_COLOR,
        "sticky top-0 border-t border-b bg-white/30 px-5 backdrop-blur-lg dark:bg-gray-900/30 sm:mx-0 sm:mt-0 sm:border-0 sm:px-0"
      )}
    >
      <ul className="mb-[-1px] flex justify-between justify-items-stretch sm:-mx-2 sm:justify-start">
        <li className="sm:hidden">
          <Link href="/">
            <a
              className={cn(
                "block h-full whitespace-nowrap  text-blue-700 dark:text-blue-200 sm:py-0 dark:sm:text-blue-500",
                {
                  "px-2 py-3": !isSticky,
                  "flex items-center pr-1": isSticky,
                  "border-b-2 border-blue-600 dark:border-blue-500":
                    router.pathname === "/" && !isSticky,
                  "hover:text-blue-600 hover:underline dark:sm:hover:text-blue-600 ":
                    router.pathname !== "/" && !isSticky,
                }
              )}
            >
              {isSticky ? (
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-blue-700 p-1 dark:border-blue-200"
                  )}
                >
                  <Image
                    src={imageMeFace}
                    alt="Alfonso Bribiesca"
                    className="dark:hidden"
                  />

                  <Image
                    src={imageMeFaceDark}
                    alt="Alfonso Bribiesca"
                    className="hidden dark:block"
                  />
                </div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              )}
            </a>
          </Link>
        </li>

        {links.map(({ href, label }, index) => (
          <li
            className={cn({
              "sm:hidden": index === 0,
            })}
            key={href}
          >
            <Link href={href}>
              <a
                className={cn(
                  "block h-full whitespace-nowrap px-2 py-3 text-blue-700 dark:text-blue-200 sm:py-0 dark:sm:text-blue-500",
                  {
                    "border-b-2 border-blue-600 dark:border-blue-500":
                      router.pathname === href,
                    "hover:text-blue-600 hover:underline dark:sm:hover:text-blue-600 ":
                      router.pathname !== href,
                  }
                )}
              >
                {label}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MainMenu;

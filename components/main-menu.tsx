import Link from "next/link";
import cn from "classnames";
import { useRouter } from "next/router";
import { BORDER_COLOR } from "../lib/cssClasses";
import { useCallback, useEffect, useState } from "react";
import Container from "./container";

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
  const [menuOpened, setMenuOpened] = useState(false);

  const scrollListener = useCallback(() => {
    const nav = document.querySelector("nav")!;

    const { top } = nav.getBoundingClientRect();

    if (top === 0 && !isSticky) {
      setIsSticky(true);
    } else if (top > 0 && isSticky) {
      setIsSticky(false);
    }
  }, [isSticky]);

  useEffect(() => {
    scrollListener();

    const scrollHandler = () => scrollListener();

    window.addEventListener("touchmove", scrollHandler);
    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("touchmove", scrollHandler);
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [scrollListener]);

  const toggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  return (
    <nav
      className={cn(
        BORDER_COLOR,
        "no-scrollbar sticky top-0 overflow-auto border-b bg-white/30 backdrop-blur-lg dark:bg-gray-900/30"
      )}
    >
      <Container
        className={cn("flex items-center justify-between", {
          hidden: !isSticky,
        })}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full  bg-blue-700 p-1 dark:bg-blue-200",
            {
              hidden: !isSticky,
            }
          )}
        >
          <img
            src="/images/face-icon.svg"
            alt="Alfonso Bribiesca"
            className="dark:hidden"
          />

          <img
            src="/images/face-icon-dark.svg"
            alt="Alfonso Bribiesca"
            className="hidden dark:block"
          />
        </div>

        <button
          type="button"
          aria-label="open menu"
          onClick={toggleMenu}
          className={cn(
            "group relative flex h-11 flex-col items-center justify-center"
          )}
        >
          <span
            className={cn(
              "top-0 block w-6 rounded-full border border-blue-700 transition-transform duration-100 ease-in-out group-hover:border-blue-600 dark:border-blue-200 dark:group-hover:border-blue-100",
              {
                "-translate-y-1": !menuOpened,
                "translate-y-[2px] rotate-45": menuOpened,
              }
            )}
          ></span>
          <span
            className={cn(
              "block w-6 rounded-full border border-blue-700 transition-transform duration-100 ease-in-out group-hover:border-blue-600 dark:border-blue-200 dark:group-hover:border-blue-100",
              {
                "translate-y-1": !menuOpened,
                "-rotate-45": menuOpened,
              }
            )}
          ></span>
        </button>
      </Container>

      <ul
        className={cn(
          "mx-auto mb-[-1px] flex max-w-xl justify-between justify-items-stretch px-4",
          {
            hidden: isSticky && !menuOpened,
          }
        )}
      >
        <li>
          <Link href="/">
            <a
              className={cn(
                "block h-full whitespace-nowrap px-2 py-3 text-blue-700 dark:text-blue-200",
                {
                  "border-b-2 border-blue-600 dark:border-blue-500":
                    router.pathname === "/",
                  "hover:text-blue-600 hover:underline":
                    router.pathname !== "/",
                }
              )}
            >
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
            </a>
          </Link>
        </li>

        {links.map(({ href, label }, index) => (
          <li key={href}>
            <Link href={href}>
              <a
                className={cn(
                  "block h-full whitespace-nowrap px-2 py-3 text-blue-700 dark:text-blue-200",
                  {
                    "border-b-2 border-blue-600 dark:border-blue-500":
                      router.pathname === href,
                    "hover:text-blue-600 hover:underline":
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

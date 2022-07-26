import Link from "next/link";
import cn from "classnames";
import { useRouter } from "next/router";
import { BORDER_COLOR } from "../lib/cssClasses";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Container from "./container";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";

const links = [
  {
    href: "/",
    label: (
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
    ),
  },
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
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = navRef.current;

    const observer = new IntersectionObserver(
      ([e]) => {
        console.log(":D", e.intersectionRatio < 1);
        setIsSticky(e.intersectionRatio < 1);
      },
      {
        rootMargin: "-1px 0px 0px 0px",
        threshold: [1],
      }
    );

    observer.observe(nav);

    return () => {
      observer.unobserve(nav);
    };
  }, []);

  useEffect(() => {}, []);

  const toggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const useDropdownMenu = useMemo(() => isSticky, [isSticky]);

  const showDropdownMenu = useMemo(
    () => useDropdownMenu && menuOpened,
    [menuOpened, useDropdownMenu]
  );

  useEffect(() => {
    if (menuOpened) {
      disableBodyScroll(scrollableRef.current);
    } else {
      enableBodyScroll(scrollableRef.current);
    }
  }, [menuOpened]);

  return (
    <nav
      ref={navRef}
      className={cn(BORDER_COLOR, "no-scrollbar top-0 mb-8 border-b", {
        "overflow-auto": isSticky,
        "fixed h-screen w-screen bg-white dark:bg-gray-900": showDropdownMenu,
        "sticky bg-white/30 backdrop-blur-lg dark:bg-gray-900/30":
          !showDropdownMenu,
      })}
    >
      <Container
        className={cn("flex h-11 items-center justify-between", {
          hidden: !isSticky,
        })}
      >
        <Link href="/">
          <a
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
          </a>
        </Link>

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

      <div
        ref={scrollableRef}
        className={cn("mx-auto flex max-w-xl flex-col overflow-auto px-4", {
          hidden: isSticky && !menuOpened,
          "h-11": !isSticky,
        })}
      >
        <ul
          className={cn(
            "mb-[-1px] flex flex-grow justify-between justify-items-stretch",
            {
              "flex-col": useDropdownMenu,
            }
          )}
        >
          {links.map(({ href, label }, index) => (
            <li key={href}>
              <Link href={href}>
                <a
                  className={cn(
                    "flex h-full items-center whitespace-nowrap text-blue-700 dark:text-blue-200",
                    {
                      "border-b-2 border-blue-600 dark:border-blue-500":
                        router.pathname === href && !useDropdownMenu,
                      "hover:text-blue-600 hover:underline":
                        router.pathname !== href && !useDropdownMenu,
                      "px-2": !useDropdownMenu,
                      [`${BORDER_COLOR} border-t py-3`]: useDropdownMenu,
                      "font-semibold":
                        useDropdownMenu && router.pathname === href,
                    }
                  )}
                >
                  {index === 0 && menuOpened ? "Home" : label}
                </a>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className={cn("mb-2 flex justify-center space-x-4", {
            hidden: !isSticky,
          })}
        >
          <a
            href=""
            className=" text-blue-700 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
          </a>

          <a
            href=""
            className="text-blue-700 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default MainMenu;

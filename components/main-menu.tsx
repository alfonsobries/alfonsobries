import Link from "next/link";
import cn from "classnames";
import { useRouter } from "next/router";
import { BORDER_COLOR } from "../lib/cssClasses";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SwitchButton from "./switch-button";
import Spinner from "./spinner";
import { ReactSVG } from "react-svg";
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
    href: "/posts",
    label: "Posts",
  },
  {
    href: "/labs",
    label: "Labs",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

type Props = {
  pinned?: boolean;
  navigationTitle?: string | React.ReactNode;
  useLightLogo?: boolean;
  maxWidthClass?: string;
};

const MainMenu = ({
  pinned = false,
  navigationTitle,
  useLightLogo,
  maxWidthClass = "max-w-xl",
}: Props) => {
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(pinned);
  const [menuOpened, setMenuOpened] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pinned) {
      return;
    }

    const nav = navRef.current;

    const observer = new IntersectionObserver(
      ([e]) => {
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
  }, [setIsSticky, pinned]);

  const toggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const useDropdownMenu = useMemo(() => isSticky, [isSticky]);

  const showDropdownMenu = useMemo(
    () => useDropdownMenu && menuOpened,
    [menuOpened, useDropdownMenu]
  );

  return (
    <div
      ref={navRef}
      className={cn(
        BORDER_COLOR,
        "no-scrollbar top-[-1px] z-50 mb-8 flex w-full flex-col border-y",
        !isSticky && maxWidthClass,
        {
          "overflow-auto border-transparent shadow-sm": isSticky,
          "mx-auto before:absolute before:-my-1 before:hidden before:h-14 before:w-5 before:bg-gradient-to-r before:from-white/100 before:to-white/0 before:content-[''] after:absolute after:right-0 after:top-0 after:-my-1 after:hidden after:h-14 after:w-5 after:bg-gradient-to-l after:from-white/100 after:to-white/0 after:content-[''] dark:before:from-gray-900/100 dark:before:to-gray-900/0 dark:after:from-gray-900/100 dark:after:to-gray-900/0 sm:before:block sm:after:block":
            !isSticky,
          "fixed h-screen w-screen bg-white dark:bg-gray-900": showDropdownMenu,
          "sticky bg-white/30 backdrop-blur-lg dark:bg-gray-900/30":
            !showDropdownMenu,
        }
      )}
    >
      <div
        className={cn(
          "flex h-11 w-full items-center justify-between space-x-4",
          isSticky && maxWidthClass,
          {
            hidden: !isSticky,
            "mx-auto px-4": isSticky,
          }
        )}
      >
        <div className="relative flex items-center space-x-3 overflow-auto">
          <Link href="/">
            <a className="flex h-8 w-8 shrink-0 origin-bottom items-center justify-center rounded-full bg-blue-700 p-1 dark:bg-blue-200">
              {useLightLogo ? (
                <ReactSVG
                  src="/images/face-icon-light.svg"
                  loading={() => <Spinner />}
                />
              ) : (
                <ReactSVG
                  src="/images/face-icon.svg"
                  loading={() => <Spinner />}
                />
              )}
            </a>
          </Link>

          <span className="truncate font-cursive text-2xl font-bold text-gray-900 dark:text-gray-300">
            {navigationTitle || "Alfonso's Website"}
          </span>
        </div>

        <div className="flex items-center">
          <SwitchButton
            className="flex h-8 items-center px-2 text-blue-700 hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-200"
            icon
          />

          <span className={`border-l ${BORDER_COLOR} mx-2 h-5`}></span>

          <button
            type="button"
            aria-label="Open menu"
            onClick={toggleMenu}
            className="group relative flex h-8 flex-col items-center justify-center px-2"
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
        </div>
      </div>

      <nav
        className={cn("mx-auto flex w-full  flex-col px-4", maxWidthClass, {
          "flex-grow overflow-auto": isSticky,
          hidden: isSticky && !menuOpened,
          "h-11": !isSticky,
        })}
      >
        <ul
          className={cn("mb-[-1px] flex", {
            "flex-grow justify-between justify-items-stretch": !isSticky,
            "flex-col": useDropdownMenu,
          })}
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
      </nav>
    </div>
  );
};

export default MainMenu;

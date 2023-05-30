import Link from "next/link";
import cn from "classnames";
import { NextRouter, useRouter } from "next/router";
import { BORDER_COLOR, LINK_COLOR_BG } from "../lib/cssClasses";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SwitchButton from "./switch-button";
import Spinner from "./spinner";
import { ReactSVG } from "react-svg";
import Twitter from "./icons/twitter";
import Github from "./icons/github";
import Home from "./icons/home";
import classNames from "classnames";
import { LocaleCode } from "../interfaces/localization";
import urls from "../helpers/urls";

type MenuLink = {
  selected: (router: NextRouter) => boolean;
  href: ({
    locale,
    router,
  }: {
    locale: LocaleCode;
    router: NextRouter;
  }) => string;
  label:
    | string
    | React.ReactNode
    | (({ locale }: { locale: LocaleCode }) => React.ReactNode);
  mobileOnly?: boolean;
};

const links: MenuLink[] = [
  {
    selected: (router) => router.asPath === "/",
    href: ({ locale }) => urls.home({ locale }),
    label: (
      <>
        <Home className="h-5 w-5" />
        <span className="sr-only"> Home</span>
      </>
    ),
  },
  {
    selected: (router) => {
      return router.pathname.startsWith("/[posts]");
    },
    href: ({ locale }) => urls.posts({ locale }),
    label: "Posts",
  },
  {
    selected: (router) => false,
    href: ({ locale }) => urls.labs({ locale }),
    label: "Labs",
  },
  {
    selected: (router) => router.pathname.startsWith("/[about]"),
    href: ({ locale }) => urls.about({ locale }),
    label: "About",
    mobileOnly: true,
  },
  {
    selected: (router) => false,
    href: ({ locale }) => urls.contact({ locale }),
    label: "Contact",
  },
];

type Props = {
  pinned?: boolean;
  navigationTitle?: string | React.ReactNode;
  useLightLogo?: boolean;
  maxWidthClass?: string;
  hreflangUrl: string;
};

const MainMenu = ({
  pinned = false,
  navigationTitle,
  useLightLogo,
  hreflangUrl,
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

  const renderMenuLink = ({
    link,
    index,
    router,
  }: {
    link: MenuLink;
    index: number;
    router: NextRouter;
  }): React.ReactNode => {
    const locale = router.locale as LocaleCode;

    const href = link.href({ locale, router });

    const selected = link.selected(router);

    return (
      <Link href={href}>
        <a
          className={cn(
            "flex h-full items-center whitespace-nowrap text-blue-700 dark:text-blue-200",
            {
              "border-b-2 border-blue-600 dark:border-blue-500":
                selected &&
                typeof link.label !== "function" &&
                !useDropdownMenu,
              "hover:text-blue-600 hover:underline":
                !selected && !useDropdownMenu,
              "px-2": !useDropdownMenu,
              [`${BORDER_COLOR} border-t py-3`]: useDropdownMenu,
              "font-semibold":
                useDropdownMenu && typeof link.label !== "function" && selected,
            }
          )}
        >
          {typeof link.label === "function"
            ? link.label({ locale })
            : index === 0 && menuOpened
            ? "Home"
            : link.label}
        </a>
      </Link>
    );
  };

  return (
    <div
      ref={navRef}
      className={cn(
        BORDER_COLOR,
        "no-scrollbar top-[-1px] z-50 mb-8 flex w-full flex-col border-y print:mb-4 print:border-transparent",
        !isSticky && maxWidthClass,
        {
          "overflow-auto border-transparent shadow-sm print:shadow-none":
            isSticky,
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
          "flex h-11 w-full items-center justify-between space-x-4 print:border-b",
          isSticky && maxWidthClass,
          BORDER_COLOR,
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

        <div className="flex items-center print:hidden">
          <SwitchButton
            className="flex h-8 items-center px-2 text-blue-700 hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-300"
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
                "top-0 block w-6 rounded-full border border-blue-700 transition-transform duration-100 ease-in-out group-hover:border-blue-600 dark:border-blue-200 dark:group-hover:border-blue-300",
                {
                  "-translate-y-1": !menuOpened,
                  "translate-y-[2px] rotate-45": menuOpened,
                }
              )}
            ></span>
            <span
              className={cn(
                "block w-6 rounded-full border border-blue-700 transition-transform duration-100 ease-in-out group-hover:border-blue-600 dark:border-blue-200 dark:group-hover:border-blue-300",
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
        className={cn("mx-auto flex w-full flex-col px-4", maxWidthClass, {
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
          {links.map((link, index) => (
            <li
              key={index}
              className={classNames({
                hidden: link.mobileOnly && !menuOpened,
              })}
            >
              {renderMenuLink({
                link,
                index,
                router,
              })}
            </li>
          ))}

          {hreflangUrl && (
            <li>
              <Link
                href={hreflangUrl}
                locale={router.locale === "en" ? "es" : "en"}
              >
                <a
                  lang={router.locale}
                  hrefLang={router.locale === "en" ? "es" : "en"}
                  className={cn(
                    "flex h-full items-center space-x-1 whitespace-nowrap text-blue-700 dark:text-blue-200",
                    {
                      "px-2": !useDropdownMenu,
                      [`${BORDER_COLOR} border-t py-3`]: useDropdownMenu,
                    }
                  )}
                >
                  <span className="text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                  </span>
                  <span>{router.locale === "en" ? "ES" : "EN"}</span>
                </a>
              </Link>
            </li>
          )}
        </ul>

        <div
          className={cn(
            "mb-2 flex justify-center space-x-6 border-t pt-4",
            BORDER_COLOR,
            {
              hidden: !isSticky,
            }
          )}
        >
          <a
            href="https://twitter.com/alfonsobries"
            className={classNames(LINK_COLOR_BG, "rounded-full p-4 text-white")}
          >
            <Twitter className="h-5 w-5" />

            <span className="sr-only"> Twitter Profile</span>
          </a>

          <a
            href="https://github.com/alfonsobries"
            className={classNames(LINK_COLOR_BG, "rounded-full p-4 text-white")}
          >
            <Github className="h-5 w-5" />
            <span className="sr-only"> Github Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default MainMenu;

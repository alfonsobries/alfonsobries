import Image from "next/future/image";
import imageMe from "../public/images/me.svg";
import imageMeDark from "../public/images/me-dark.svg";
import Link from "next/link";
const PageHeader: React.FC<{
  small?: boolean;
  children?: React.ReactNode;
}> = ({ small = false, children }) => {
  const toggleDarkMode = (e: any) => {
    e.preventDefault();
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggleDarkMode}
        className="p-3 roudned bg-black text-white"
      >
        Toggle Dark mode
      </button>
      <div className="flex space-x-8 items-end justify-center ">
        <div className="flex-shrink-0">
          {children || (
            <>
              <Image
                src={imageMe}
                alt="Alfonso Bribiesca"
                width={small ? 50 : 130}
                className="dark:hidden"
              />

              <Image
                src={imageMeDark}
                alt="Alfonso Bribiesca"
                width={small ? 50 : 130}
                className="hidden dark:block -mt-[10px]"
              />
            </>
          )}
        </div>
        <div className="space-y-4 flex-grow">
          <h1 className="text-6xl font-bold font-cursive text-gray-700 dark:text-gray-300">
            Alfonso Bribiesca
          </h1>

          <nav className="pb-3">
            <ul className="flex -mx-2">
              <li className="px-2">
                <Link href="/">
                  <a className="text-blue-700 hover:text-blue-600 hover:underline">
                    Home
                  </a>
                </Link>
              </li>
              <li className="px-2">
                <Link href="/resume">
                  <a className="text-blue-700 hover:text-blue-600 hover:underline">
                    Resume
                  </a>
                </Link>
              </li>
              <li className="px-2">
                <a
                  className="text-blue-700 hover:text-blue-600 hover:underline"
                  href=""
                >
                  Blog
                </a>
              </li>
              <li className="px-2">
                <a
                  className="text-blue-700 hover:text-blue-600 hover:underline"
                  href=""
                >
                  Projects
                </a>
              </li>
              <li className="px-2">
                <a
                  className="text-blue-700 hover:text-blue-600 hover:underline"
                  href=""
                >
                  Contact me
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

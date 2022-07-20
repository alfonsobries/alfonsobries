import Image from "next/future/image";
import imageMe from "../public/images/me.svg";
import imageMeDark from "../public/images/me-dark.svg";
import Link from "next/link";
import Container from "./container";
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
    <Container>
      <button
        type="button"
        onClick={toggleDarkMode}
        className="p-3 roudned bg-black text-white fixed left-0 top-0 m-4"
      >
        Toggle Dark mode
      </button>
      <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0 items-center sm:items-end sm:justify-center border-b mb-8 pb-8 border-gray-100 dark:border-gray-800">
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
          <p className="text-6xl font-bold font-cursive text-gray-900 dark:text-gray-300">
            Hello, I’m{" "}
            <span className="relative after:content-[''] after:block after:absolute after:-mt-5 after:-ml-[5%] after:left-0 after:w-[110%] after:h-4 after:bg-[#fbd68b] after:opacity-50">
              Alfonso
            </span>
          </p>

          <nav>
            <ul className="flex -mx-2">
              <li className="px-2">
                <Link href="/">
                  <a className="text-sm font-semibold text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap">
                    About
                  </a>
                </Link>
              </li>
              <li className="px-2">
                <a
                  className="text-sm font-semibold text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap"
                  href=""
                >
                  Articles
                </a>
              </li>
              <li className="px-2">
                <a
                  className="text-sm font-semibold text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap"
                  href=""
                >
                  Projects
                </a>
              </li>
              <li className="px-2">
                <a
                  className="text-sm font-semibold text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap"
                  href=""
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Container>
  );
};

export default PageHeader;

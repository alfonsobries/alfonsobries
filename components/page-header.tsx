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
      <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0 items-center sm:items-end sm:justify-center sm:border-b sm:mb-8 pb-8 border-gray-100 dark:border-gray-800">
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
        <div className="sm:space-y-4 sm:flex-grow w-full sm:w-auto">
          <p className="text-6xl font-bold font-cursive text-gray-900 dark:text-gray-300 text-center sm:text-left">
            Hello, I’m{" "}
            <span className="relative after:content-[''] after:block after:absolute after:-mt-5 after:-ml-[5%] after:left-0 after:w-[110%] after:h-4 after:bg-[#fbd68b] after:opacity-50">
              Alfonso
            </span>
          </p>

          <nav className="bg-gray-900 -mx-5 px-5 sm:bg-transparent sm:mx-0 sm:px-0 mt-8 sm:mt-0">
            <ul className="flex sm:-mx-2 justify-between sm:justify-start">
              <li>
                <Link href="/">
                  <a className="sm:text-sm sm:font-semibold sm:text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap px-2 py-3 block sm:py-0 text-white">
                    About
                  </a>
                </Link>
              </li>
              <li>
                <a
                  className="sm:text-sm sm:font-semibold sm:text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap px-2 py-3 block sm:py-0 text-white"
                  href=""
                >
                  Articles
                </a>
              </li>
              <li>
                <a
                  className="sm:text-sm sm:font-semibold sm:text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap px-2 py-3 block sm:py-0 text-white"
                  href=""
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  className="sm:text-sm sm:font-semibold sm:text-blue-700 hover:text-blue-600 hover:underline whitespace-nowrap px-2 py-3 block sm:py-0 text-white"
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

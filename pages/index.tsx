import type { NextPage } from "next";
import Head from "next/head";
// import Image from "next/image";
import Image from "next/future/image";
import ArticleListItem from "../components/ArticleListItem";
import imageMe from "../public/images/me.svg";
import imageMeDark from "../public/images/me-dark.png";
import imageThisGuy from "../public/images/this-guy.png";
const Home: NextPage = () => {
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
    <div className="mx-auto max-w-lg min-h-screen">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-8 space-y-4">
        <div className="flex space-x-8 items-end justify-center ">
          <div className="flex-shrink-0">
            {/* <img src={imageMe} alt="Alfonso Bribiesca" /> */}
            <Image src={imageMe} alt="Alfonso Bribiesca" width={100} />
            {/* <div className="dark:hidden">
              <Image src={c} alt="Alfonso Bribiesca" width={} />
            </div>
            <div className="hidden dark:block">
            </div> */}
          </div>
          <div className="space-y-4 flex-grow">
            <h1 className="text-6xl font-bold font-cursive text-gray-700 dark:text-gray-300">
              Alfonso Bribiesca
            </h1>

            <nav className="pb-3">
              <ul className="flex -mx-2">
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
                    Journal
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

        <div className="border-t pt-4 border-gray-100 dark:border-gray-800">
          <h1 className="font-bold text-4xl dark:text-gray-200">
            Latest Articles
          </h1>

          <div className="space-y-4 mt-4">
            <ArticleListItem />
            <ArticleListItem />
            <ArticleListItem />
          </div>
        </div>
      </main>

      <footer className="text-xs text-gray-600">
        <div></div>
        <div className="text-center flex flex-col space-y-2">
          <span>Idea, illustrations, design and development by</span>
          <span>
            <Image src={imageThisGuy} alt="This guy" />
          </span>
        </div>

        <a href="" onClick={toggleDarkMode}>
          Dark mode
        </a>
      </footer>
    </div>
  );
};

export default Home;

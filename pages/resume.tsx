import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/future/image";
import ArticleListItem from "../components/ArticleListItem";
import imageThisGuy from "../public/images/this-guy.svg";
import PageHeader from "../components/PageHeader";
import imageIsThisA from "../public/images/is-this-a.svg";

const Resume: NextPage = () => {
  return (
    <div className="mx-auto max-w-lg min-h-screen">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-8 space-y-4">
        <PageHeader small></PageHeader>

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

        <div className="flex space-x-4 items-center justify-center">
          <Image src={imageIsThisA} alt="Alfonso Bribiesca" width={140} />

          <span className="font-cursive text-4xl mb-4 dark:text-gray-200">
            Is this a Resume?
          </span>
        </div>
      </main>

      <footer className="text-xs text-gray-400">
        <div className="text-center flex flex-col space-y-2 items-center">
          <span>Idea, illustrations, design and development by</span>
          <span>
            <Image src={imageThisGuy} alt="Alfonso Bribiesca" width={30} />
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Resume;

import Container from "../components/container";
import Layout from "../components/layout";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";
import classNames from "classnames";

export default function Contact() {
  return (
    <>
      <Layout>
        <Head>
          <title>Contact Me | {CMS_NAME}</title>
        </Head>
        <Container>
          <h1 className="mb-3 text-4xl font-bold dark:text-gray-200">
            Contact
          </h1>

          <form action="" className="mt-4 space-y-6">
            <div className="flex flex-col space-y-6 sm:flex-row sm:space-x-6 sm:space-y-0">
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Your Name
                </label>

                <div className="relative mt-1 shadow-sm">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className={classNames(
                      "block w-full rounded-sm border-gray-300 pr-10 focus:ring-blue-600  dark:border-gray-800 dark:bg-black dark:focus:ring-blue-500"
                    )}
                    // aria-invalid="true"
                    // aria-describedby="name-error"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Your Email
                </label>

                <div className="relative mt-1 shadow-sm">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className={classNames(
                      "block w-full rounded-sm border-gray-300 pr-10 focus:ring-blue-600  dark:border-gray-800 dark:bg-black dark:focus:ring-blue-500"
                    )}
                    placeholder="you@example.com"
                    // aria-invalid="true"
                    // aria-describedby="email-error"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Your message
              </label>

              <div className="relative mt-1 shadow-sm">
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  className={classNames(
                    "block w-full rounded-sm border-gray-300 pr-10 focus:ring-blue-600  dark:border-gray-800 dark:bg-black dark:focus:ring-blue-500"
                  )}
                  placeholder="you@example.com"
                  // aria-invalid="true"
                  // aria-describedby="email-error"
                ></textarea>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="block w-full rounded bg-blue-700 p-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </form>
        </Container>
      </Layout>
    </>
  );
}

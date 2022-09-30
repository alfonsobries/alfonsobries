import Head from "next/head";
import { CMS_NAME } from "../lib/constants";
import LazySvg from "../components/lazy-svg";
import React from "react";

export default function Error404() {
  return (
    <>
      <Head>
        <title>Error 404 - Page not Found! | {CMS_NAME}</title>
      </Head>
      <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-[#BFD57B]">
        {/* <div className="absolute top-0 left-0 z-50 flex w-full justify-center ">
          <span className="rounded-b-lg border-2 border-t-0 border-black bg-white py-5 pt-40 text-5xl font-bold leading-none text-black">
            Error 404
          </span>
        </div> */}
        <LazySvg
          className="absolute right-0 top-0 z-50 w-full"
          svgClassName="object-cover"
          src="/images/cloud.svg"
        />

        <LazySvg
          className="absolute left-[10%] bottom-[50%] z-20 h-auto w-[600px]"
          src="/images/door.svg"
        />

        <LazySvg
          className="absolute right-[-50%] bottom-[35%] z-20 w-[500px] max-w-full sm:right-[-30%] md:right-0"
          src="/images/flame-top-right.svg"
        />

        <LazySvg
          className="relative z-20 h-auto w-[600px]"
          src="/images/this-is-fine.svg"
        />

        <div className="absolute bottom-0 left-0 z-0 h-[50%] w-full border-2 border-black bg-[#AD8665]"></div>

        <LazySvg
          className="absolute left-[70%] bottom-0 z-30 max-h-[60%] w-[500px] max-w-full md:left-auto md:right-0"
          src="/images/flame-bottom-right.svg"
        />

        <LazySvg
          className="absolute left-[-30%] bottom-[-30%] z-30 max-h-[70%] w-[400px] max-w-full sm:bottom-0 md:left-0"
          src="/images/flame-bottom-left.svg"
        />
      </div>
    </>
  );
}

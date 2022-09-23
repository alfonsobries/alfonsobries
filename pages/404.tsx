import Head from "next/head";
import { CMS_NAME } from "../lib/constants";
import LazySvg from "../components/lazy-svg";
import React from "react";

export default function Error404() {
  return (
    <>
      <Head>
        <title>@TODO 404 | {CMS_NAME}</title>
      </Head>
      <div className="absolute inset-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#BFD57B]">
        <LazySvg
          className="absolute right-0 top-0 w-full"
          svgClassName="object-cover"
          src="/images/animations/cloud.svg"
        />

        <LazySvg
          className="absolute right-0 top-[200px] z-10 w-[300px] max-w-full"
          src="/images/animations/flame-bottom-right.svg"
        />

        <img
          src="/images/temp-this-fine.png"
          className="relative z-10 h-auto w-[650px]"
        />

        <div className="absolute bottom-0 left-0 z-0 h-[50%] w-full border-2 border-black bg-[#AD8665]"></div>

        <LazySvg
          className="absolute right-0 bottom-0 z-20 w-[500px] max-w-full"
          src="/images/animations/flame-bottom-right.svg"
        />
        <LazySvg
          className="absolute left-0 bottom-0 z-20  -ml-[100px]  w-[500px] max-w-full  skew-x-[180deg]"
          src="/images/animations/flame-bottom-right.svg"
        />
      </div>
    </>
  );
}

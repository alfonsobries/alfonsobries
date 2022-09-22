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
      <div className="absolute inset-0 flex h-screen w-full overflow-hidden bg-[#BFD57B]">
        <LazySvg
          className="absolute right-0 top-0 w-full"
          svgClassName="object-cover"
          src="/images/animations/cloud.svg"
        />

        <LazySvg
          className="absolute right-0 bottom-0 -mr-[140px]  w-[500px] max-w-full"
          src="/images/animations/this-is-fine.svg"
        />
        <LazySvg
          className="absolute left-0 bottom-0 -mr-[140px] w-[500px] max-w-full"
          src="/images/animations/right-flame-loop.svg"
        />
        {/* <LazySvg
          className="absolute left-0 bottom-0 -ml-[140px] -mb-[100px] w-[700px] max-w-full"
          src="/images/animations/this-is-fine.svg"
        /> */}
      </div>
    </>
  );
}

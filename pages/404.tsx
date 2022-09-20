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
      <div className="pointer-events-none absolute inset-0 flex h-screen w-screen items-end">
        <LazySvg className="w-full" src="/images/animations/this-is-fine.svg" />
      </div>
    </>
  );
}

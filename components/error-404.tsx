import LazySvg from "../components/lazy-svg";
import React, { useEffect } from "react";
import Home from "./icons/home";
import Link from "next/link";
import ArrowLeft from "./icons/arrow-left";

let resetTimeout: NodeJS.Timeout | null = null;
let messageIndex = 0;

const toggleGlobe = () => {
  const globe = document.getElementById("globe")!;
  const isHidden = globe.classList.contains("opacity-0");

  if (resetTimeout) {
    clearTimeout(resetTimeout);
    resetTimeout = null;
  }

  if (isHidden) {
    document
      .getElementById("Cara")
      .querySelectorAll("animate")
      .forEach((el) => el.beginElement());

    globe.classList.remove("opacity-0");
    globe.classList.add("opacity-100");

    if (messageIndex === 0) {
      document.getElementById("message").innerHTML = "This is fine!";
      document.getElementById("message2").classList.add("hidden");
      messageIndex = 1;
    } else {
      document.getElementById("message").innerHTML = "Error 404";
      document.getElementById("message2").classList.remove("hidden");
      messageIndex = 0;
    }

    resetTimeout = setTimeout(() => {
      toggleGlobe();
    }, 3000);
  } else {
    globe.classList.remove("opacity-100");
    globe.classList.add("opacity-0");

    resetTimeout = setTimeout(() => {
      toggleGlobe();
    }, 500);
  }
};

export default function Error404() {
  useEffect(() => {
    return () => clearTimeout(resetTimeout);
  }, []);

  return (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-[#BFD57B]">
      <div className="absolute bottom-0 left-0 z-0 h-[50%] w-full border-t-2 border-black bg-[#AD8665]"></div>

      <LazySvg
        className="absolute right-0 top-0 z-30 w-full"
        svgClassName="object-cover"
        src="/images/cloud-2.svg"
        showLoading={false}
      />

      <LazySvg
        className="absolute right-0 top-0 z-50 w-full"
        svgClassName="object-cover"
        src="/images/cloud.svg"
        showLoading={false}
      />

      <LazySvg
        className="absolute left-[10%] bottom-[50%] z-20 h-auto w-[600px]"
        src="/images/door.svg"
        showLoading={false}
      />

      <LazySvg
        className="absolute right-[-50%] bottom-[40%] z-20 w-[500px] max-w-full sm:bottom-[30%] sm:right-[-30%] md:right-0"
        src="/images/flame-top-right.svg"
        showLoading={false}
      />

      <div
        onClick={toggleGlobe}
        className="relative z-40 h-auto w-[600px] cursor-pointer"
      >
        <div
          id="globe"
          className="flex-0 aspect-video absolute inset-0 z-50 mt-[-40px] ml-[40%] flex max-h-[34vh] w-[220px] max-w-[60vw] flex-col items-center justify-center bg-[url('/images/globe.svg')] bg-contain bg-center bg-no-repeat text-center text-black opacity-0 transition-opacity duration-200 ease-in-out sm:w-[300px]"
        >
          <span id="message" className="font-cursive text-4xl sm:text-5xl">
            Error 404
          </span>
          <span id="message2" className="font-cursive text-4xl">
            Page Not Found
          </span>
        </div>

        <LazySvg
          svgClassName="max-h-[65vh]"
          src="/images/this-is-fine.svg"
          onReady={toggleGlobe}
          showLoading={false}
        />
      </div>

      <LazySvg
        className="absolute left-[70%] bottom-0 z-40 max-h-[60%] w-[500px] max-w-full md:left-auto md:right-0"
        src="/images/flame-bottom-right.svg"
        showLoading={false}
      />

      <LazySvg
        className="absolute left-[-30%] bottom-[-30%] z-40 max-h-[70%] w-[400px] max-w-full sm:bottom-0 md:left-0"
        src="/images/flame-bottom-left.svg"
        showLoading={false}
      />

      <div className="absolute bottom-0 z-50 mb-4 flex space-x-4">
        <button
          onClick={() => window.history.back()}
          type="button"
          className="flex items-center space-x-2 rounded-xl bg-black/50 px-4 py-2 text-base text-white hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4 text-white/50" /> <span>Back</span>
        </button>

        <Link href="/">
          <a className="flex items-center space-x-2 rounded-xl bg-black/50 px-4 py-2 text-base text-white hover:bg-black">
            <Home className="h-4 w-4 text-white/50" /> <span>Go Home</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

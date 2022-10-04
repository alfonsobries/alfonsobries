import LazySvg from "../components/lazy-svg";
import React, { useEffect } from "react";
import Meta from "../components/meta";
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
    <>
      <Meta
        meta={{
          title: "Error 404 - Page Not Found!",
          description: "",
          image: "",
        }}
      >
        <style>
          {`
            html, body {
              height: 100vh;
              width: 100vw;
              margin:0;
              padding:0;
              overflow: hidden;
          }
        `}
        </style>
      </Meta>

      <div className="absolute inset-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-[#BFD57B]">
        <LazySvg
          className="absolute right-0 top-0 z-30 w-full"
          svgClassName="object-cover"
          src="/images/cloud-2.svg"
        />

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

        <div
          onClick={toggleGlobe}
          className="relative z-40 h-auto w-[600px] cursor-pointer"
        >
          <div
            id="globe"
            className="flex-0 absolute inset-0 z-50 mt-[-40px] ml-[40%] flex aspect-video max-h-[34vh] w-[220px] max-w-[60vw] flex-col items-center justify-center bg-[url('/images/globe.svg')] bg-contain bg-center bg-no-repeat text-center text-black opacity-0 transition-opacity duration-200 ease-in-out sm:w-[300px]"
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
          />
        </div>

        <div className="absolute bottom-0 left-0 z-0 h-[50%] w-full border-t-2 border-black bg-[#AD8665]"></div>

        <LazySvg
          className="absolute left-[70%] bottom-0 z-40 max-h-[60%] w-[500px] max-w-full md:left-auto md:right-0"
          src="/images/flame-bottom-right.svg"
        />

        <LazySvg
          className="absolute left-[-30%] bottom-[-30%] z-40 max-h-[70%] w-[400px] max-w-full sm:bottom-0 md:left-0"
          src="/images/flame-bottom-left.svg"
        />
      </div>
    </>
  );
}

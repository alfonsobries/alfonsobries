import React from "react";
import Error404 from "../components/error-404";
import Meta from "../components/meta";

export default function Error404Page() {
  return (
    <>
      <Meta
        meta={{
          title: "Error 404 - This is fine!",
          description:
            "This is Fine! A copy of the 404 page of this site featuring one of my favorite memes for sharing purposes. Check out the source code on GitHub.",
          image: "https://www.alfonsobries.com/images/og/this-is-fine.png",
        }}
      >
        <style>
          {`
            html, body {
              height: 100%;
              width: 100%;
              margin:0;
              padding:0;
              overflow: hidden;
          }
        `}
        </style>
      </Meta>

      <Error404 />
    </>
  );
}

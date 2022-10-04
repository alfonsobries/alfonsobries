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
            "A copy of the custom 404 page of this site featuring the this is fine meme. Share it with your friends and check out the source code on GitHub.",
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
import React from "react";
import Error404 from "../components/error-404";
import Meta from "../components/meta";

export default function Error404Page() {
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

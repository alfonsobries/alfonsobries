import React from "react";
import Error404 from "../components/error-404";
import Meta from "../components/meta";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Error404Page() {
  const { t } = useTranslation();
  return (
    <>
      <Meta
        meta={{
          title: "Error 404 - Page Not Found!",
          description: "The page you're looking for doesn't exist ¯\\_(ツ)_/¯",
          image: "https://www.alfonsobries.com/images/og/this-is-fine.png",
        }}
        t={t}
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

export const getStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
};

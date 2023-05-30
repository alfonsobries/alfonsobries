import { NextRouter } from "next/router";
import { LocaleCode } from "../interfaces/localization";
import { Post } from "../interfaces/post";

const urls = {
  home: ({ locale }: { locale: LocaleCode }) => {
    if (locale === "en") {
      return "/";
    }

    return `/${locale}`;
  },
  posts: ({ locale }: { locale: LocaleCode }) => {
    if (locale === "en") {
      return "/posts";
    }

    return `/${locale}/publicaciones`;
  },
  labs: ({ locale }: { locale: LocaleCode }) => {
    if (locale === "en") {
      return "/labs";
    }

    return `/${locale}/labs`;
  },
  about: ({ locale }: { locale: LocaleCode }) => {
    if (locale === "en") {
      return "/about";
    }

    return `/${locale}/sobre-mi`;
  },
  contact: ({ locale }: { locale: LocaleCode }) => {
    if (locale === "en") {
      return "/contact";
    }

    return `/${locale}/contacto`;
  },
  post: ({ post, locale }: { post: Post; locale: LocaleCode }) => {
    if (locale === "es") {
      return `/${locale}/publicaciones/${post.slugs.es}`;
    }

    return `/posts/${post.slugs.en}`;
  },
};

export default urls;

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
  posts: ({ locale, page = 1 }: { locale: LocaleCode; page?: number }) => {
    if (locale === "en") {
      return `/posts${page > 1 ? `/page/${page}` : ""}`;
    }

    return `/${locale}/publicaciones${page > 1 ? `/page/${page}` : ""}`;
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
  resume: ({ locale }: { locale: LocaleCode }) => {
    if (locale === "en") {
      return "/resume";
    }

    return `/${locale}/curriculum`;
  },
  post: ({ post, locale }: { post: Post; locale: LocaleCode }) => {
    if (locale === "es") {
      return `/${locale}/publicaciones/${post.slugs.es}`;
    }

    return `/posts/${post.slugs.en}`;
  },
  draftPost: ({
    post,
    locale,
    secret,
  }: {
    post: Post;
    locale: LocaleCode;
    secret: string;
  }) => {
    if (locale === "es") {
      return `/${locale}/secret/${secret}/posts/${post.slugs.es}`;
    }

    return `/secret/${secret}/posts/${post.slugs.en}`;
  },
};

export default urls;

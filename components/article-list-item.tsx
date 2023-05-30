import classNames from "classnames";
import Link from "next/link";
import { Post } from "../interfaces/post";
import { LINK_COLOR_TEXT } from "../lib/cssClasses";
import DateFormatter from "./date-formatter";
import ReadTime from "./read-time";
import urls from "../helpers/urls";
import { LocaleCode } from "../interfaces/localization";
import { TFunction } from "next-i18next";

const ArticleListItem: React.FC<{
  post: Post;
  locale: LocaleCode;
  t: TFunction;
}> = ({ post, locale, t }) => {
  const postUrl = urls.post({
    post,
    locale,
  });

  return (
    <article>
      <h2 className="not-prose">
        <Link href={postUrl}>
          <a className="font-semibold text-gray-800 no-underline hover:underline dark:text-gray-200">
            {post.title}
          </a>
        </Link>
      </h2>

      <p>{post.excerpt}</p>

      <p className="flex items-center justify-between">
        <span className="flex items-center space-x-2 text-sm text-gray-500">
          <DateFormatter dateString={post.published_at} />
          <span className="hidden text-xs text-gray-300 dark:text-gray-700 sm:inline">
            ●
          </span>
          <ReadTime t={t} content={post.body} className="hidden sm:inline" />
        </span>

        <Link href={postUrl}>
          <a className={classNames(LINK_COLOR_TEXT, "text-sm hover:underline")}>
            {t("common:read_more")} →
          </a>
        </Link>
      </p>
    </article>
  );
};

export default ArticleListItem;

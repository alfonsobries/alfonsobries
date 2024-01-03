import classNames from "classnames";
import Link from "next/link";
import { useMemo } from "react";
import { Pagination } from "../interfaces/pagination";
import {
  BORDER_COLOR,
  LINK_COLOR_TEXT,
  LINK_COLOR_TEXT_DISABLED,
} from "../lib/cssClasses";
import { TFunction } from "next-i18next";

type Props = {
  t: TFunction;
  pagination: Pagination;
  path: string;
};

const Pagination = ({
  pagination: { next_page_url, current_page, prev_page_url, total, from, to },
  path,
  t,
}: Props) => {
  const nextPageUrl = useMemo(() => {
    if (next_page_url === null) {
      return null;
    }

    return `${path}/page/${current_page + 1}`;
  }, [current_page, path, next_page_url]);

  const prevPageUrl = useMemo(() => {
    if (prev_page_url === null) {
      return null;
    }

    if (current_page === 2) {
      return path;
    }

    return `${path}/page/${current_page - 1}`;
  }, [prev_page_url, path, current_page]);

  return (
    <nav
      className={classNames(
        BORDER_COLOR,
        "mt-8 flex items-center justify-between border-t pt-8"
      )}
      aria-label={t("pagination:pagination")}
    >
      <div className="hidden sm:block">
        <p className="text-gray-500">
          {t("pagination:showing")}{" "}
          <span className="font-semibold">{from}</span> {t("pagination:to")}{" "}
          <span className="font-semibold">{to}</span> {t("pagination:of")}{" "}
          <span className="font-semibold">{total}</span>{" "}
          {t("pagination:results")}{" "}
        </p>
      </div>
      <div className="flex flex-1 justify-between space-x-4 sm:justify-end">
        {prevPageUrl !== null ? (
          <Link
            href={prevPageUrl}
            className={classNames(
              LINK_COLOR_TEXT,
              "relative inline-flex items-center hover:underline"
            )}
          >
            ← {t("pagination:previous")}
          </Link>
        ) : (
          <span
            className={classNames(
              LINK_COLOR_TEXT_DISABLED,
              "relative inline-flex items-center text-sm"
            )}
          >
            ← {t("pagination:previous")}
          </span>
        )}

        {nextPageUrl !== null ? (
          <Link
            href={nextPageUrl}
            className={classNames(
              LINK_COLOR_TEXT,
              "relative inline-flex items-center hover:underline"
            )}
          >
            {t("pagination:next")} →
          </Link>
        ) : (
          <span
            className={classNames(
              LINK_COLOR_TEXT_DISABLED,
              "relative inline-flex items-center text-sm"
            )}
          >
            {t("pagination:next")} →
          </span>
        )}
      </div>
    </nav>
  );
};

export default Pagination;

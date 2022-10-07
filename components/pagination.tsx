import classNames from "classnames";
import Link from "next/link";
import { useMemo } from "react";
import { Pagination } from "../interfaces/pagination";
import {
  BORDER_COLOR,
  LINK_COLOR_TEXT,
  LINK_COLOR_TEXT_DISABLED,
} from "../lib/cssClasses";

type Props = {
  pagination: Pagination;
  path: string;
};

const Pagination = ({
  pagination: { next_page_url, current_page, prev_page_url, total, from, to },
  path,
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

    return `${path}/page/${current_page - 1}`;
  }, [prev_page_url, path, current_page]);

  return (
    <nav
      className={classNames(
        BORDER_COLOR,
        "mt-8 flex items-center justify-between border-t pt-8"
      )}
      aria-label="Pagination"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold">{from}</span> to{" "}
          <span className="font-semibold">{to}</span> of{" "}
          <span className="font-semibold">{total}</span> results
        </p>
      </div>
      <div className="flex flex-1 justify-between space-x-4 sm:justify-end">
        {prevPageUrl !== null ? (
          <Link href={prevPageUrl}>
            <a
              className={classNames(
                LINK_COLOR_TEXT,
                "relative inline-flex items-center text-sm hover:underline"
              )}
            >
              ← Previous
            </a>
          </Link>
        ) : (
          <span
            className={classNames(
              LINK_COLOR_TEXT_DISABLED,
              "relative inline-flex items-center text-sm"
            )}
          >
            ← Previous
          </span>
        )}

        {nextPageUrl !== null ? (
          <Link href={nextPageUrl}>
            <a
              className={classNames(
                LINK_COLOR_TEXT,
                "relative inline-flex items-center text-sm hover:underline"
              )}
            >
              Next →
            </a>
          </Link>
        ) : (
          <span
            className={classNames(
              LINK_COLOR_TEXT_DISABLED,
              "relative inline-flex items-center text-sm"
            )}
          >
            Next →
          </span>
        )}
      </div>
    </nav>
  );
};

export default Pagination;

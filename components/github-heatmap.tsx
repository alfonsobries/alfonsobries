import classNames from "classnames";
import React from "react";

const formatMonth = (time: string): string => {
  const date = new Date(Number(time));
  const options: Intl.DateTimeFormatOptions = { month: "short" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

enum ContributionLevel {
  FIRST_QUARTILE = "FIRST_QUARTILE",
  FOURTH_QUARTILE = "FOURTH_QUARTILE",
  NONE = "NONE",
  SECOND_QUARTILE = "SECOND_QUARTILE",
  THIRD_QUARTILE = "THIRD_QUARTILE",
}

export default function GithubHeatmap({
  githubContributions,
}: {
  githubContributions: {
    [key: number]: any[];
  };
}) {
  const months = Object.keys(githubContributions).filter(
    (month, index) => index > 7 && githubContributions[month].length > 2
  );

  return (
    <div className="flex w-full overflow-hidden">
      {months.map((month, index) => {
        return (
          <div
            key={month}
            className={classNames("flex flex-col overflow-auto", {
              "print:hidden": index <= 0,
            })}
            style={{
              flex: githubContributions[month].length,
            }}
          >
            <span className="truncate px-2 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 ">
              {formatMonth(month)}
            </span>
            <div className="flex">
              {Object.keys(githubContributions[Number(month)]).map((week) => {
                return (
                  <div
                    key={`${month}:${week}`}
                    className="mt-2 flex flex-1 flex-col"
                  >
                    {Object.keys(
                      githubContributions[Number(month)][Number(week)]
                    ).map((day) => {
                      return (
                        <div key={`${month}:${week}:${day}`} className="p-0.5">
                          <div
                            className={classNames(
                              "h-0 w-full overflow-hidden pt-[100%]",
                              {
                                "bg-blue-50 dark:bg-gray-800":
                                  githubContributions[Number(month)][
                                    Number(week)
                                  ][Number(day)].contributionLevel ===
                                  ContributionLevel.NONE,
                                "bg-blue-300 dark:bg-gray-700":
                                  githubContributions[Number(month)][
                                    Number(week)
                                  ][Number(day)].contributionLevel ===
                                  ContributionLevel.FIRST_QUARTILE,
                                "bg-blue-500 dark:bg-gray-500":
                                  githubContributions[Number(month)][
                                    Number(week)
                                  ][Number(day)].contributionLevel ===
                                  ContributionLevel.SECOND_QUARTILE,
                                "bg-blue-700 dark:bg-gray-300":
                                  githubContributions[Number(month)][
                                    Number(week)
                                  ][Number(day)].contributionLevel ===
                                  ContributionLevel.THIRD_QUARTILE,
                                "bg-blue-900  dark:bg-gray-100":
                                  githubContributions[Number(month)][
                                    Number(week)
                                  ][Number(day)].contributionLevel ===
                                  ContributionLevel.FOURTH_QUARTILE,
                              }
                            )}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

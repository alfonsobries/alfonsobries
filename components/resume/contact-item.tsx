/* eslint-disable react/jsx-no-target-blank */
import classNames from "classnames";
import React from "react";
import { cloneElement } from "react";
import { LINK_COLOR_TEXT } from "../../lib/cssClasses";

type Props = {
  children: React.ReactNode;
  icon: React.ReactElement;
  link: string;
  external?: boolean;
};

const ResumeContactItem = ({
  children,
  icon,
  link,
  external = true,
}: Props) => {
  return (
    <li>
      <a
        className={classNames(
          LINK_COLOR_TEXT,
          "inline-flex items-center space-x-2"
        )}
        href={link}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {cloneElement(icon, {
          className: "w-4 h-4 ",
        })}
        <span className="text-sm">{children}</span>
      </a>
    </li>
  );
};

export default ResumeContactItem;

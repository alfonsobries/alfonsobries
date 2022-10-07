/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import { cloneElement } from "react";

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
        className="inline-flex items-center space-x-2 text-blue-700 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-600"
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

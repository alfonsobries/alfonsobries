import React from "react";
import { Form } from "@alfonsobries/react-use-form";
import classNames from "classnames";
import Spinner from "../spinner";

type ButtonProps = Omit<React.HTMLProps<HTMLButtonElement>, "form"> & {
  form: Form;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const FormButton: React.FC<ButtonProps> = ({
  form,
  children,
  type = "submit",
  className,
  disabled,
  ...attributes
}) => {
  return (
    <button
      type={type}
      className={classNames(
        className,
        "flex justify-center rounded bg-blue-700 p-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50 dark:bg-blue-500",
        {
          "hover:bg-blue-600 dark:hover:bg-blue-600": !form.busy && !disabled,
        }
      )}
      disabled={form.busy || disabled}
      {...attributes}
    >
      {form.busy ? <Spinner size="sm" /> : children}
    </button>
  );
};

export default FormButton;

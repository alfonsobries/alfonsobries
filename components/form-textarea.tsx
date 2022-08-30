import React, { useCallback } from "react";
import { Form } from "@alfonsobries/react-use-form";
import classNames from "classnames";

type TextareaProps = Omit<React.HTMLProps<HTMLTextAreaElement>, "form"> & {
  form: Form;
};

const FormTextarea: React.FC<TextareaProps> = ({
  name,
  form,
  ...attributes
}) => {
  const changeHandler = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      form.set(name, event.currentTarget.value);
      form.errors.clear(name);
    },
    [form, name]
  );

  return (
    <textarea
      value={form[name]}
      onChange={changeHandler}
      name={name}
      id={name}
      className={classNames(
        "block w-full rounded-sm focus:outline-none disabled:opacity-50  dark:bg-black dark:focus:ring-blue-500",
        {
          "border-gray-300 focus:ring-blue-600 dark:border-gray-800":
            !form.errors.has(name),
          "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:text-red-100":
            form.errors.has(name),
        }
      )}
      disabled={form.busy}
      aria-invalid={form.errors.has(name) ? "true" : undefined}
      aria-describedby={form.errors.has(name) ? `${name}-error` : undefined}
      {...attributes}
    />
  );
};

export default FormTextarea;

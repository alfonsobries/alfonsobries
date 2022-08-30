import { Form } from "@alfonsobries/react-use-form";

const InputGrup: React.FC<
  {
    label: string;
    inputName: string;
    form: Form;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ inputName, children, form, label, ...attributes }) => {
  return (
    <div {...attributes}>
      <label
        htmlFor={inputName}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      <div className="relative mt-1 shadow-sm">
        {children}

        {form.errors.has(inputName) && (
          <span
            className="text-xs leading-none text-red-500"
            id={`${inputName}-error`}
          >
            {form.errors.get(inputName)}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputGrup;

type Props = {
  children?: JSX.Element | string;
  show?: boolean;
};

import { Transition } from "@tailwindui/react";

const Alert = ({ children, show = false }: Props) => {
  return (
    <div className="fixed bottom-0 left-0 flex w-full items-center justify-center">
      <Transition
        show={show}
        enter="transition-all duration-150"
        enterFrom="translate-y-20 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition-all duration-150"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-20 opacity-0"
      >
        <div className="my-4 w-full max-w-xl rounded-md bg-red-50 p-4 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-red-400"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 text-sm font-semibold text-red-700">
              {children}
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Alert;

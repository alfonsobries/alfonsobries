import FormTextarea from "./form/form-textarea";
import InputGrup from "./form/input-group";
import useForm, { Form } from "@alfonsobries/react-use-form";
import { useCallback, useEffect, useRef, useState } from "react";
import FormButton from "./form/form-button";
import classNames from "classnames";
import { Post } from "../interfaces/post";
import { LINK_COLOR_TEXT } from "../lib/cssClasses";
import LazySvg from "./lazy-svg";

type Props = {
  post: Post;
  onSubmitted?: () => void;
  onCancel: () => void;
  onError: (response: any) => void;
};

const TypoFormForm = ({ post, onSubmitted, onCancel, onError }: Props) => {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showText, setShowText] = useState(false);
  const [mouseOutWhileShowingText, setMouseOutWhileShowingText] =
    useState(false);

  const wrapperRef = useRef(null);

  const form: Form = useForm({
    post_slug: post.slug,
    typo: true,
    message: "",
  });

  const closeForm = useCallback(() => {
    setClosing(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
        // Time should match the animation duration
      }, 300);
    });
  }, []);

  const cancel = useCallback(() => {
    closeForm().then(() => {
      onCancel();
    });
  }, [onCancel, closeForm]);

  const formHandler = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();

      form
        .post("contact")
        .then(() => {
          onSubmitted && onSubmitted();
        })
        .catch((response) => onError(response));
    },
    [form, onSubmitted, onError]
  );

  useEffect(() => {
    setMounted(true);

    const keydownListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancel();
      }
    };

    wrapperRef.current.focus();

    window.addEventListener("keydown", keydownListener);

    return () => {
      window.removeEventListener("keydown", keydownListener);
    };
  }, [wrapperRef, cancel]);

  const clickPopupHandler = useCallback(() => {
    if (form.successful) {
      cancel();
    }

    if (showText) {
      setShowText(false);
    }
  }, [form, cancel, showText]);

  const popupMouseEnterHandler = useCallback(() => {
    if (showText && mouseOutWhileShowingText) {
      setShowText(false);
    }
  }, [showText, mouseOutWhileShowingText]);

  useEffect(() => {
    if (!showText) {
      setMouseOutWhileShowingText(false);
    }
  }, [showText]);

  const popupMouseLeaveHandler = useCallback(() => {
    if (showText) {
      setMouseOutWhileShowingText(true);
    }
  }, [showText]);

  return (
    <>
      <div
        className={classNames(
          "fixed inset-0 z-[51] h-screen w-screen bg-black/50 transition-all duration-300 dark:bg-black/20",
          {
            "pointer-events-none opacity-0 backdrop-blur-0":
              !mounted || closing,
            "opacity-100 backdrop-blur-md": !(!mounted || closing),
            "pointer-events-none hidden": showText,
          }
        )}
        onClick={cancel}
      ></div>

      <div
        ref={wrapperRef}
        tabIndex={0}
        className={classNames(
          "fixed bottom-0 left-0 right-0 z-[52] mx-auto rounded-t-xl bg-white p-4 shadow-xl-bottom outline-none transition-all duration-300 dark:bg-black md:bottom-auto md:top-[50%] md:right-auto md:max-w-sm md:-translate-y-[50%] md:rounded-r-xl md:rounded-tl-none md:shadow-xl",
          {
            "pointer-events-none translate-y-full opacity-0 md:-translate-x-full":
              !mounted || closing,
            "opacity-100 md:translate-x-0": mounted && !closing,
            "translate-y-0": mounted && !showText,
            "translate-y-[75%] md:translate-x-[-75%]": mounted && showText,
          }
        )}
        onClick={clickPopupHandler}
        onMouseEnter={popupMouseEnterHandler}
        onMouseLeave={popupMouseLeaveHandler}
      >
        {form.successful ? (
          <div
            onClick={close}
            className="mx-auto flex flex-col items-center justify-center space-y-6 text-center"
          >
            <LazySvg src="/images/crying.svg" width={120} height={120} />

            <span className="font-cursive text-3xl text-gray-900 dark:text-gray-200">
              Thanks for the report!
            </span>

            <p>I&apos;ll fix it as soon as possible. </p>
            <p>
              <em>(Click anywhere to close this popup).</em>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={formHandler}>
              <div className="prose mb-6 text-sm dark:prose-invert ">
                <p>
                  <button
                    type="button"
                    className={classNames(
                      LINK_COLOR_TEXT,
                      "font-semibold underline"
                    )}
                    onClick={() => setShowText(!showText)}
                  >
                    {showText
                      ? "Restore the form position"
                      : "Let me see the text"}
                  </button>
                </p>
                <p className="text-xl font-semibold">
                  Did you notice a typo, grammar error, or poor redaction?
                </p>
                <p>
                  Since English is not my native language, I <del>made</del>{" "}
                  make some mistakes from time to time 😅.
                </p>
                <p>
                  I want to do better! If possible, please add a short
                  description of the issue. I will fix it as my main priority.
                </p>
              </div>

              <InputGrup
                className="flex-1"
                form={form}
                inputName="message"
                label="Please describe me the issue"
              >
                <FormTextarea
                  name="message"
                  form={form}
                  placeholder="I think you meant..."
                  rows={3}
                  required
                />
              </InputGrup>

              <div className="mt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500"
                  onClick={cancel}
                >
                  Cancel
                </button>
                <FormButton
                  form={form}
                  className="w-32"
                  disabled={!form.message}
                >
                  Send
                </FormButton>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default TypoFormForm;

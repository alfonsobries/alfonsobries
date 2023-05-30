import Container from "../components/container";
import Layout from "../components/layout";
import classNames from "classnames";
import LazySvg from "../components/lazy-svg";
import React, { useState } from "react";
import Spinner from "../components/spinner";
import useForm, { Form } from "@alfonsobries/react-use-form";
import InputGrup from "../components/form/input-group";
import FormInput from "../components/form/form-input";
import FormTextarea from "../components/form/form-textarea";
import Alert from "../components/alert";
import urls from "../helpers/urls";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Contact() {
  const [errored, setErrored] = useState(false);
  const form: Form = useForm({
    name: "",
    email: "",
    message: "",
  });

  const formHandler = (e: React.SyntheticEvent) => {
    e.preventDefault();

    setErrored(false);

    form.post("contact").catch(() => setErrored(true));
  };
  const { locale } = useRouter();

  const { t } = useTranslation();

  return (
    <>
      <Layout
        meta={{
          title: "Contact me",
          description:
            "If you have any questions or comments or would like to make a proposal, feel free to use the contact form on this page.",
          image: `https://og.alfonsobries.com/Contact%20Me`,
        }}
        hreflangUrl={urls.contact({
          locale: locale === "en" ? "es" : "en",
        })}
        t={t}
      >
        <Container>
          <Alert show={errored}>Something went wrong. Please try again.</Alert>

          <div className="prose dark:prose-invert">
            {form.successful ? (
              <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-6 text-center">
                <span className="font-cursive text-5xl text-gray-900 dark:text-gray-200">
                  Thanks for reaching me!
                </span>

                <LazySvg src="/images/crying.svg" width={200} height={200} />

                <p>
                  Your message was successfully sent. If you are not a spam bot,
                  or you are a very good spam bot, you should receive a response
                  from me within a few hours.
                </p>
              </div>
            ) : (
              <>
                <h1 className="mb-3 text-4xl font-bold dark:text-gray-200">
                  Contact Me
                </h1>

                <p>
                  Comments, inquiries, suggestions, or want to say hi? I’d love
                  to hear! Fill this form out and hit send.
                </p>

                <form onSubmit={formHandler} className="mt-4 space-y-6">
                  <div className="flex flex-col space-y-6 sm:flex-row sm:space-x-6 sm:space-y-0">
                    <InputGrup
                      className="flex-1"
                      form={form}
                      inputName="name"
                      label="Your Name"
                    >
                      <FormInput
                        name="name"
                        form={form}
                        placeholder="Alfonso"
                        required
                      />
                    </InputGrup>

                    <InputGrup
                      className="flex-1"
                      form={form}
                      inputName="email"
                      label="Your Email"
                    >
                      <FormInput
                        type="email"
                        name="email"
                        form={form}
                        placeholder="you@example.com"
                        required
                      />
                    </InputGrup>
                  </div>

                  <InputGrup
                    className="flex-1"
                    form={form}
                    inputName="message"
                    label="Your Message"
                  >
                    <FormTextarea
                      name="message"
                      form={form}
                      placeholder="What can I do for you? "
                      rows={4}
                      required
                    />
                  </InputGrup>

                  <div>
                    <button
                      type="submit"
                      className={classNames(
                        "flex w-full justify-center rounded bg-blue-700 p-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50 dark:bg-blue-500",
                        {
                          "hover:bg-blue-600 dark:hover:bg-blue-600":
                            !form.busy,
                        }
                      )}
                      disabled={form.busy}
                    >
                      {form.busy ? <Spinner size="sm" /> : <>Send</>}
                    </button>
                  </div>
                </form>

                {form.successful !== true && (
                  <div className="mt-8 flex flex-col items-center space-y-2 text-center">
                    <span className="flex space-x-3">
                      <img
                        src="/images/is-this-a.svg"
                        alt="Alfonso Bribiesca"
                        width={120}
                        height={120}
                      />

                      <span className="mt-4 font-cursive text-4xl text-gray-900 dark:text-gray-200">
                        is this engagement?
                      </span>
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </Layout>
    </>
  );
}

export const getStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
};

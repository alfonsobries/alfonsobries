import { AppProps } from "next/app";
import "../styles/index.css";
import { FormContext } from "@alfonsobries/react-use-form";
import { ThemeProvider } from "next-themes";
import { Api } from "../lib/api";
import { appWithTranslation } from "next-i18next";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <FormContext.Provider value={Api}>
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </FormContext.Provider>
  );
};

export default appWithTranslation(MyApp);

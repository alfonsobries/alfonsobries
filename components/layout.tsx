import { useEffect } from "react";
import useIsHome from "../hooks/useIsHome";
import Footer from "./footer";
import MainMenu from "./main-menu";
import Meta from "./meta";
import PageHeader from "./page-header";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const isHome = useIsHome();

  return (
    <>
      <Meta />
      <main>
        <PageHeader small={!isHome} />

        <MainMenu />
        <div>{children}</div>
      </main>
      <Footer />
    </>
  );
};

export default Layout;

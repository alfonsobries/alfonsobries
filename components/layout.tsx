import { useEffect } from "react";
import Footer from "./footer";
import MainMenu from "./main-menu";
import Meta from "./meta";
import PageHeader from "./page-header";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  useEffect(() => {
    console.log("load layout");
  }, []);

  console.log("load layout 2");
  return (
    <>
      <Meta />
      <main>
        <PageHeader />

        <MainMenu />
        <div>{children}</div>
      </main>
      <Footer />
    </>
  );
};

export default Layout;

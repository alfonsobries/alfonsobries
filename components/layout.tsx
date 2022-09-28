import useIsHome from "../hooks/useIsHome";
import Footer from "./footer";
import MainMenu from "./main-menu";
import Meta from "./meta";
import PageHeader from "./page-header";

type Props = {
  children: React.ReactNode;
  meta: {
    title: string;
    description: string;
    image: string;
    path?: string;
    ogType?: string;
  };
};

const Layout = ({ children, meta }: Props) => {
  const isHome = useIsHome();

  return (
    <>
      <Meta meta={meta} />
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

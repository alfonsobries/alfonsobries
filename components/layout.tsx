import useIsHome from "../hooks/useIsHome";
import Footer from "./footer";
import MainMenu from "./main-menu";
import Meta from "./meta";
import PageHeader from "./page-header";

type Props = {
  children: React.ReactNode;
  pinned?: boolean;
  hideFooter?: boolean;
  useLightLogo?: boolean;
  navigationTitle?: string | React.ReactNode;
  maxWidthClass?: string;
  hreflangUrl?: string;
  meta: {
    title: string;
    description: string;
    image?: string;
    path?: string;
    ogType?: string;
    hidePageName?: boolean;
  };
};

const Layout = ({
  children,
  meta,
  pinned = false,
  navigationTitle,
  hideFooter = false,
  useLightLogo,
  maxWidthClass,
  hreflangUrl,
}: Props) => {
  const isHome = useIsHome();

  return (
    <>
      <Meta meta={meta} hreflangUrl={hreflangUrl} />

      <main>
        <PageHeader small={!isHome} pinned={pinned} />

        <MainMenu
          pinned={pinned}
          navigationTitle={navigationTitle}
          useLightLogo={useLightLogo}
          maxWidthClass={maxWidthClass}
          hreflangUrl={hreflangUrl}
        />

        <div>{children}</div>
      </main>

      {hideFooter || <Footer />}
    </>
  );
};

export default Layout;

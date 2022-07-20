import ArticleListItem from "./article-list-item";
import Footer from "./footer";
import Meta from "./meta";
import PageHeader from "./page-header";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Meta />
      <main>
        <PageHeader />
        <div>{children}</div>
      </main>
      <Footer />
    </>
  );
};

export default Layout;

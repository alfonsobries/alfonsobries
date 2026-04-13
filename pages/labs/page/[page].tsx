import Labs, { PROJECTS_PER_PAGE, getStaticProps } from "../../labs";
import { getProjects } from "../../../lib/api";

export default Labs;

export { getStaticProps };

export async function getStaticPaths({ locales }) {
  const pagination = await getProjects({
    page: 1,
    perPage: PROJECTS_PER_PAGE,
  });

  const pages = Array.from(
    { length: pagination.last_page },
    (_, i) => i + 1
  ).slice(1);

  return {
    paths: pages.flatMap((page) => {
      return locales.flatMap((locale: string) => {
        return {
          params: {
            page: page.toString(),
          },
          locale,
        };
      });
    }),
    fallback: false,
  };
}

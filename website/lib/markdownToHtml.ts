import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeExternalLinks from "rehype-external-links";

export default async function markdownToHtml(
  markdown: string,
): Promise<string> {
  const result = await remark()
    .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
    .use(rehypeExternalLinks, { target: "_blank", rel: ["nofollow"] })
    .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings.
    .process(markdown);

  return result.toString();
}

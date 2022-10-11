import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkExternalLinks from "remark-external-links";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkExternalLinks, { target: "_blank", rel: ["nofollow"] })
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
    .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings
    .process(markdown);
  return result.toString();
}

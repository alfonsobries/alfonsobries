import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
    .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings
    .process(markdown);
  return result.toString();
}

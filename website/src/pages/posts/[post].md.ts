import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { post: post.id },
    props: post,
  }));
}

function cleanMdxBody(body: string): string {
  return (
    body
      // Strip import lines
      .replace(/^import\s+.*$/gm, "")
      // Replace <Image alt="..." ... /> with [Image: alt text]
      .replace(/<Image\s+[^>]*alt="([^"]*)"[^>]*\/>/g, "[Image: $1]")
      // Remove any remaining JSX self-closing tags
      .replace(/<[A-Z][a-zA-Z]*\s[^>]*\/>/g, "")
      .trim()
  );
}

export function GET(context: { props: CollectionEntry<"posts"> }) {
  const post = context.props;
  const date = post.data.createdAt.toISOString().split("T")[0];
  const cleaned = cleanMdxBody(post.body ?? "");

  const md = `# ${post.data.title}

> ${post.data.description}

**Date:** ${date}

---

${cleaned}
`;

  return new Response(md, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

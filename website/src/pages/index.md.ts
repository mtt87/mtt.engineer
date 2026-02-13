import { getCollection } from "astro:content";

export async function GET() {
  const posts = (await getCollection("posts")).sort(
    (a, b) => b.data.createdAt.valueOf() - a.data.createdAt.valueOf(),
  );

  const lines: string[] = [];

  lines.push("# Mattia Asti");
  lines.push("");
  lines.push(
    "I'm Mattia, a self-taught software engineer with 14+ years of experience. I work best with TypeScript across the full stack but I specialize on the frontend where I've been using React for many years. I started learning Rust in 2024.",
  );
  lines.push("");
  lines.push(
    "My CV is available in [PDF](/mattia_asti.pdf), [HTML](/cv), [JSON](/cv.json), or [Markdown](/cv.md).",
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Posts");
  lines.push("");

  for (const post of posts) {
    lines.push(`- [${post.data.title}](/posts/${post.id})`);
    lines.push(`  ${post.data.description}`);
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

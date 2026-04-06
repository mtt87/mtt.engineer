import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/**/*.mdx", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export const collections = { posts };

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    date: z.coerce.date(),
    reading_time: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    hero_image: z.string().optional(),
    series: z.object({
      name: z.string(),
      part: z.number(),
    }).optional(),
    comments: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

// X Article drafts. File name matches the blog post's file name; rendered at /x/<id>/.
const x = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/x' }),
  schema: z.object({
    title: z.string().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = { blog, x };

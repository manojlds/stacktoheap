import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
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

export const collections = { blog };

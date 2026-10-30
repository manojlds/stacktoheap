import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { exportMarkdown } from '@/lib/x-export';

// Markdown for the ?x export tools on each post. Not linked from anywhere.
export const getStaticPaths = (async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { id: post.id }, props: { body: post.body ?? '' } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify({ markdown: exportMarkdown(props.body as string) }), {
    headers: { 'content-type': 'application/json' },
  });

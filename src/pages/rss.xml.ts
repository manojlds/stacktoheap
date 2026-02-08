import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const sortedPosts = posts.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'StackToHeap',
    description: 'No Overflow - A blog by Manoj Mahalingam',
    site: context.site!,
    items: sortedPosts.map((post) => {
      const { date } = post.data;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.excerpt ?? '',
        link: `/blog/${year}/${month}/${day}/${post.slug}/`,
        categories: post.data.categories,
      };
    }),
  });
}

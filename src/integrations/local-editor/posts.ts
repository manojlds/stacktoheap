import { getCollection } from 'astro:content';
import { comparePostsByDateDesc } from '@/lib/utils';

export interface EditablePost {
  id: string;
  title: string;
  date: Date;
  draft: boolean;
  file: string;
  url: string;
}

/** Every post, drafts included, newest first. */
export async function editablePosts(): Promise<EditablePost[]> {
  const posts = (await getCollection('blog')).sort(comparePostsByDateDesc);
  return posts.map((post) => {
    const { date } = post.data;
    const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')];
    return {
      id: post.id,
      title: post.data.title,
      date,
      draft: post.data.draft,
      file: post.filePath ?? `src/content/blog/${post.id}.mdx`,
      url: `/blog/${day.join('/')}/${post.id}/`,
    };
  });
}

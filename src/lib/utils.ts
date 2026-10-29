import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Newest first. Same-timestamp posts are ordered by id descending.
 * The only tie is 2013-03-14: git-learns-to-ignore-better comes before
 * git-learns-pre-push-hook, which is the previous feed order.
 */
export function comparePostsByDateDesc(
  a: { id: string; data: { date: Date } },
  b: { id: string; data: { date: Date } },
) {
  return b.data.date.valueOf() - a.data.date.valueOf() || b.id.localeCompare(a.id);
}

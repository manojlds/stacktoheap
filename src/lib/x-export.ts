// Markdown for the ?x export tools on blog posts (src/scripts/x-export.ts).

/** Stands in for an interactive component; the rich copy uses the same text for [data-x-omit]. */
export const OMITTED = '[Interactive part omitted, see the original post]';

/**
 * The post's Markdown as X should receive it: diagrams and images become
 * `[Insert image n]`, numbered like the rendered page, MDX-only lines
 * (imports, layout wrappers) are dropped, and self-closing components
 * become the OMITTED marker.
 */
export function exportMarkdown(source: string): string {
  const out: string[] = [];
  let fence: 'code' | 'mermaid' | undefined;
  // Inside a component tag that spans several lines.
  let component = false;
  let image = 0;
  for (const line of source.split('\n')) {
    if (component) {
      if (/>\s*$/.test(line)) component = false;
      continue;
    }
    if (line.startsWith('```')) {
      if (!fence) {
        fence = line.trim() === '```mermaid' ? 'mermaid' : 'code';
        if (fence === 'code') out.push(line);
      } else {
        if (fence === 'mermaid') out.push(`[Insert image ${++image}]`);
        else out.push(line);
        fence = undefined;
      }
      continue;
    }
    if (fence === 'mermaid') continue;
    if (fence === 'code') {
      out.push(line);
      continue;
    }
    if (/^import\s.+\sfrom\s/.test(line) || /^\s*<\/?div\b[^>]*>\s*$/.test(line)) continue;
    // A component's own opening or closing line wraps Markdown; keep what it wraps.
    if (/^\s*<\/?[A-Z][\w.]*(\s[^>]*)?(?<!\/)>\s*$/.test(line)) continue;
    if (/^\s*<[A-Z]/.test(line)) {
      out.push(OMITTED);
      component = !/>\s*$/.test(line);
      continue;
    }
    out.push(
      line
        .replace(/!\[[^\]]*\]\([^)]*\)/g, () => `[Insert image ${++image}]`)
        .replace(/<img\b[^>]*>/g, () => `[Insert image ${++image}]`),
    );
  }
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

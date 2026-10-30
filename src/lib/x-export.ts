// Markdown for the ?x export tools on blog posts (src/scripts/x-export.ts).

/**
 * The post's Markdown as X should receive it: diagrams and images become
 * `[Insert image n]`, numbered like the rendered page, and MDX-only lines
 * (imports, layout wrappers) are dropped.
 */
export function exportMarkdown(source: string): string {
  const out: string[] = [];
  let fence: 'code' | 'mermaid' | undefined;
  let image = 0;
  for (const line of source.split('\n')) {
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
    if (/^import\s.+\sfrom\s/.test(line) || /^<\/?div\b[^>]*>\s*$/.test(line)) continue;
    out.push(line.replace(/!\[[^\]]*\]\([^)]*\)/g, () => `[Insert image ${++image}]`));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

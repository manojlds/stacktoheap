import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
  site: 'https://stacktoheap.com',
  // Astro 7 defaults this to 'jsx', which drops whitespace between inline
  // elements. `true` keeps the Astro 5 HTML-aware compression.
  compressHTML: true,
  integrations: [
    mermaid({
      theme: 'neutral',
      autoTheme: true,
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    // astro-mermaid 2.1 registers remark/rehype plugins. Its Sätteri mdast
    // plugin emits `{ type: 'html' }` nodes that @astrojs/mdx 8 cannot compile.
    // TODO: Drop @astrojs/markdown-remark and unified() once astro-mermaid
    // supports MDX 8. Mermaid is being replaced with pele.run next anyway.
    processor: unified(),
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { peleDiagrams } from './src/plugins/pele-diagrams.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://stacktoheap.com',
  // Astro 7 defaults this to 'jsx', which drops whitespace between inline
  // elements. `true` keeps the Astro 5 HTML-aware compression.
  compressHTML: true,
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: satteri({
      hastPlugins: [peleDiagrams],
    }),
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

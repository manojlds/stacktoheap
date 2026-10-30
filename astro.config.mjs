import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { peleDiagrams } from './src/plugins/pele-diagrams.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://stacktoheap.com',
  vite: {
    plugins: [tailwindcss()],
  },
  // Astro 7 defaults this to 'jsx', which drops whitespace between inline
  // elements. `true` keeps the Astro 5 HTML-aware compression.
  compressHTML: true,
  // /x/ pages are X Article exports, not part of the site.
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/x/') })],
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

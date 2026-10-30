# StackToHeap

[![Deploy](https://github.com/manojlds/stacktoheap/actions/workflows/deploy.yml/badge.svg)](https://github.com/manojlds/stacktoheap/actions/workflows/deploy.yml)
[![CI](https://github.com/manojlds/stacktoheap/actions/workflows/ci.yml/badge.svg)](https://github.com/manojlds/stacktoheap/actions/workflows/ci.yml)
[![CodeQL](https://github.com/manojlds/stacktoheap/actions/workflows/codeql.yml/badge.svg)](https://github.com/manojlds/stacktoheap/actions/workflows/codeql.yml)

**No Overflow** - A technical blog about software development, DevOps, and technology.

This is the Astro-powered version of StackToHeap, migrated from Jekyll for better performance and modern development experience.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🛠️ Technology Stack

- **[Astro](https://astro.build)** - Static site generator
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[MDX](https://mdxjs.com/)** - Markdown with JSX support

## 📁 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable Astro components
│   ├── content/
│   │   └── blog/        # Blog posts (MDX)
│   ├── layouts/         # Page layouts
│   ├── lib/             # Utility functions
│   ├── pages/           # Routes and pages
│   └── styles/          # Global styles
├── astro.config.mjs     # Astro configuration
├── src/styles/global.css # Tailwind theme and global styles
└── package.json
```

## ✨ Features

- 📝 **Content Collections** - Type-safe blog posts with frontmatter validation
- 🎨 **Modern UI** - shadcn-inspired components with Tailwind CSS
- 🌙 **Dark Mode** - Automatic dark mode based on system preferences
- 🔍 **SEO Optimized** - Meta tags, Open Graph, and sitemap
- 🏷️ **Tags & Categories** - Browse posts by topic
- ⚡ **Fast Performance** - Optimized static site generation
- 📱 **Responsive** - Mobile-friendly design

## 📝 Adding Content

Create a new MDX file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
excerpt: "A brief description"
date: 2025-02-05
reading_time: "5 mins"
categories: [category1, category2]
tags: [tag1, tag2]
comments: true
---

Your content here...
```

## Deploy

The site is a static Astro build served as [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/). [`wrangler.jsonc`](./wrangler.jsonc) names the Worker `stacktoheap` and serves `./dist`, the output of `pnpm build`.

```bash
pnpm build
npx wrangler deploy
```

`pnpm build` type-checks the project and writes the site to `./dist`. `wrangler deploy` uploads that directory. The custom domain is attached to the Worker in Cloudflare.

Cloudflare Workers Builds also builds and deploys automatically from Git; `wrangler deploy` is the manual path.

### GitHub Workflows

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — type check, build, and Lighthouse on pull requests and pushes to `main`
- [`.github/workflows/codeql.yml`](./.github/workflows/codeql.yml) — CodeQL analysis on pull requests, pushes to `main`, and a weekly schedule
- [`.github/workflows/dependency-review.yml`](./.github/workflows/dependency-review.yml) — dependency review on pull requests to `main`

See [.github/WORKFLOWS.md](./.github/WORKFLOWS.md) for detailed workflow documentation.

See [MIGRATION.md](./MIGRATION.md) for more details about the Jekyll to Astro migration.

## 📄 License

ISC

## 👤 Author

**Manoj Mahalingam**
- Twitter: [@manojlds](https://twitter.com/manojlds)
- GitHub: [@manojlds](https://github.com/manojlds)
- Website: [stacktoheap.com](https://stacktoheap.com)
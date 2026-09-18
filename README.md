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
├── tailwind.config.mjs  # Tailwind configuration
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

## 🚢 Deployment

The site automatically deploys to GitHub Pages when pushed to the `main` branch via GitHub Actions.

### GitHub Workflows

- **Deploy** - Builds and deploys to GitHub Pages on push to `main`
- **CI** - Runs type checking, linting, and build validation on PRs
- **PR Preview** - Posts build statistics on pull requests
- **PR Preview Deploy** - Automatic preview deployments for verified contributors (requires setup)
- **Dependency Review** - Scans dependencies for security issues
- **CodeQL** - Automated security code scanning

See [.github/WORKFLOWS.md](./.github/WORKFLOWS.md) for detailed workflow documentation.

#### Setting Up PR Previews

To enable automatic preview deployments for pull requests:
1. Follow the setup guide in [.github/PREVIEW_SETUP.md](./.github/PREVIEW_SETUP.md)
2. Choose a platform: Cloudflare Pages (recommended), Netlify, or Vercel
3. Add required secrets to GitHub
4. Preview URLs will be posted automatically on PRs from verified contributors

**Security:** Only repository contributors can trigger preview deployments. PRs from forks are blocked for security.

See [MIGRATION.md](./MIGRATION.md) for more details about the Jekyll to Astro migration.

## 📄 License

ISC

## 👤 Author

**Manoj Mahalingam**
- Twitter: [@manojlds](https://twitter.com/manojlds)
- GitHub: [@manojlds](https://github.com/manojlds)
- Website: [stacktoheap.com](https://stacktoheap.com)
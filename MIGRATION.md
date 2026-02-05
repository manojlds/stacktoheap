# Jekyll to Astro Migration Guide

This document outlines the migration from Jekyll to Astro for the StackToHeap blog.

## Overview

The site has been migrated from Jekyll to Astro with the following improvements:
- Modern build system with Astro
- Tailwind CSS with Typography plugin
- shadcn-inspired UI components
- TypeScript support
- Better performance and SEO

## URL Structure

The original Jekyll URL structure has been preserved:
```
/blog/:year/:month/:day/:title/
```

This ensures all existing links continue to work without redirects.

## Technology Stack

### Core
- **Astro 5.x**: Static site generator
- **TypeScript**: Type-safe development
- **MDX**: Enhanced Markdown with component support

### Styling
- **Tailwind CSS 4.x**: Utility-first CSS framework
- **@tailwindcss/typography**: Beautiful typography defaults
- **Custom CSS Variables**: Dark mode support

### Integrations
- **@astrojs/mdx**: MDX support
- **@astrojs/sitemap**: Automatic sitemap generation
- **@astrojs/tailwind**: Tailwind integration

## Content Structure

### Blog Posts
Blog posts are stored in `src/content/blog/` as MDX files.

#### Frontmatter Schema
```yaml
title: "Post Title"
excerpt: "Brief description"
date: 2025-02-05
reading_time: "5 mins"
categories: [category1, category2]
tags: [tag1, tag2, tag3]
image: "optional-image.jpg"
comments: true
draft: false
```

### Collections
Content is managed using Astro's Content Collections with type-safe schemas defined in `src/content/config.ts`.

## Features

### SEO
- Meta tags for all pages
- Open Graph support
- Twitter Card support
- Canonical URLs
- Sitemap generation

### Navigation
- Responsive header with navigation
- Tags and categories pages
- Archive pages by year
- Dark mode support (via system preference)

### Components
Custom components following shadcn design patterns:
- `Card.astro`: Card container
- `Button.astro`: Button component with variants
- `SEO.astro`: SEO meta tags
- `Header.astro`: Site header
- `Footer.astro`: Site footer

### Layouts
- `BaseLayout.astro`: Main layout wrapper
- `BlogPost.astro`: Blog post layout with metadata

## Development

### Commands
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Adding Content
1. Create a new `.mdx` file in `src/content/blog/`
2. Add frontmatter with required fields
3. Write content in Markdown/MDX
4. The file will be automatically picked up

## Deployment

The site is configured for GitHub Pages deployment:
- GitHub Actions workflow at `.github/workflows/deploy.yml`
- Automatic deployment on push to main branch
- Build artifacts stored in `dist/`

## Migration Checklist

- [x] Setup Astro project
- [x] Configure Tailwind CSS
- [x] Create content collections
- [x] Implement URL structure
- [x] Add SEO components
- [x] Create layouts and components
- [x] Add tags/categories pages
- [x] Setup GitHub Actions deployment
- [ ] Migrate all Jekyll posts
- [ ] Add analytics (Google Analytics)
- [ ] Add comments system (Disqus/Giscus)
- [ ] Optimize images
- [ ] Add RSS feed
- [ ] Test all links and pages

## Notes for Future Development

### Adding New Components
Follow the shadcn pattern:
1. Create component in `src/components/`
2. Use `cn()` utility for className merging
3. Support dark mode via CSS variables

### Adding New Integrations
```bash
npx astro add [integration-name]
```

### Performance Tips
- Use Astro's image optimization for images
- Keep JavaScript minimal (leverage Astro's static-first approach)
- Use appropriate caching headers in deployment

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

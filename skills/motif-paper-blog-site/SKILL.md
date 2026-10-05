---
name: motif-paper-blog-site
description: "A minimal, typography-first blog home: an editorial hero, featured essays with generated covers, a post list you can search and filter by tag, a yearly archive and an author note. Reads like a small printed booklet, in light or dark. Use when the user asks for Paper Blog, 纸页博客, blog, minimal, writing, search, tags, archive, dark-mode or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/jetbrains-mono, @fontsource-variable/newsreader, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/paper-blog-site"
  motif-item: "paper-blog-site"
  params-hash: "68d572a3"
---

# Paper Blog (纸页博客)

A minimal, typography-first blog home: an editorial hero, featured essays with generated covers, a post list you can search and filter by tag, a yearly archive and an author note. Reads like a small printed booklet, in light or dark.

## When to use

- A blog or writing home page for an individual or a small publication: hero, featured posts, filterable recent posts, archive and author note.
- Adapt it by editing POSTS, TAGS and the author copy. Posts are plain data; wire them to a CMS or MDX collection without changing markup.

## Files

- `assets/paper-blog-site.tsx` — the component (`PaperBlogSite`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-paper-blog-site`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/jetbrains-mono @fontsource-variable/newsreader clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/paper-blog-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { PaperBlogSite } from '@/components/motif/paper-blog-site/paper-blog-site'

<PaperBlogSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `name` | Small Hours | Small Hours | ≤ 24 chars | Site name |
| `headline` | Notes on building software that stays out of the way. | Notes on building software that stays out of the way. | ≤ 80 chars | Headline |
| `accent` | #1c6fb8 | #1c6fb8 | color | Title links, tags and focus rings; lightened automatically in dark mode |
| `fontPair` | serif | serif | serif / mono / sans / literary | Font pairing |
| `radius` | 8 | 8 | 0–20 px (best 2–14) | Corner radius |
| `dark` | false | false | boolean | The header moon button toggles it too |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Reading comes first: content column is 48rem max, body text is at least 16px with 1.6+ line-height, and the page has no imagery except generated covers on featured posts.
- One accent color. Titles are accent-colored links with a dashed underline on hover; tags, focus rings and the active nav item use the same accent. Never use two accents.
- The accent text color (--accent-text) is derived per theme so links keep contrast on both backgrounds; use it for text and use --accent for fills.
- Dates and read time are shown in the UI font at 12px; headings use the head font at weight 500–600, never bold 800.
- Search and tag filters are client-side and must stay keyboard operable (aria-pressed on tag buttons, a labelled search input).
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from satnaing/astro-paper).

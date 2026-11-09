---
name: motif-posts-series-index
description: "An index for a multi-part tutorial or course. Each part shows its number, reading time and level and has its own read tick. A segmented progress bar spans the series, a \"Continue with Part 4\" button jumps to the next unread part, and a short prerequisites note sits alongside. For engineering blogs, docs guides and free courses. Use when the user asks for Tutorial Series Index, 系列教程目录, series, tutorial, course, reading progress, table of contents, docs, blog or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/newsreader, @fontsource-variable/space-grotesk, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/posts-series-index"
  motif-item: "posts-series-index"
  params-hash: "162077c3"
---

# Tutorial Series Index (系列教程目录)

An index for a multi-part tutorial or course. Each part shows its number, reading time and level and has its own read tick. A segmented progress bar spans the series, a "Continue with Part 4" button jumps to the next unread part, and a short prerequisites note sits alongside. For engineering blogs, docs guides and free courses.

## When to use

- Use as the landing page of a multi-part tutorial, course or docs guide. Pass your own parts, meta and prereqs props (they default to the sample SERIES, SERIES_META and PREREQS): each part needs a stable id, an href, a reading time in minutes and a level; meta holds the description, author, role and updated date; an empty prereqs array hides the "Before you start" note.
- Pass storageKey to remember read ticks in localStorage, or control completed / onCompletedChange to sync progress with an account. onContinue and onOpenPart hook the Continue button and the part links into your router.

## Files

- `assets/posts-series-index.tsx` — the component (`PostsSeriesIndex`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-posts-series-index`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/newsreader @fontsource-variable/space-grotesk clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/posts-series-index/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { PostsSeriesIndex } from '@/components/motif/posts-series-index/posts-series-index'

<PostsSeriesIndex />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #f4b860 | #f4b860 | color | The progress bar, the Continue button, read ticks and the up-next marker |
| `font` | serif | serif | serif / grotesk / sans | Heading font |
| `radius` | 14 | 14 | 0–20 px (best 6–16) | Corner radius |
| `layout` | rail | rail | rail / cards / table | Layout |
| `numbering` | padded | padded | padded / decimal / roman | Numbering |
| `showProgress` | true | true | boolean | Show progress |
| `showPrereqs` | true | true | boolean | The "Before you start" note |
| `heading` | Local-first, from scratch | Local-first, from scratch | ≤ 48 chars | Heading |

## Rules

- Keep parts in reading order: Continue always points at the first unread part, not the one after the last tick.
- Titles under about 50 characters, summaries one sentence. Reading times are honest estimates rounded to the minute.
- Use 3 to 12 parts. Past that, split the series into volumes rather than shrinking the rows.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

---
name: motif-posts-list
description: "An article grid with generated SVG covers and a featured first post. Switch to a cover list or a text-only index, with category filtering built in. Use when the user asks for Posts List, 文章列表, blog, posts, articles, journal, editorial or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/posts-list"
  motif-item: "posts-list"
  params-hash: "e42f835d"
---

# Posts List (文章列表)

An article grid with generated SVG covers and a featured first post. Switch to a cover list or a text-only index, with category filtering built in.

## When to use

- Use for a blog or journal landing section. Replace the POSTS array with real entries; covers are generated from the accent and seed.

## Files

- `assets/posts-list.tsx` — the component (`PostsList`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-posts-list`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/posts-list/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { PostsList } from '@/components/motif/posts-list/posts-list'

<PostsList />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `layout` | grid | grid | grid / list / index | Layout |
| `count` | 6 | 6 | 3–6 | Posts |
| `seed` | 8 | 8 | 1–999 | A different seed redraws every cover |
| `heading` | Notes from the studio | Notes from the studio | ≤ 36 chars | Heading |
| `subheading` | Engineering write-ups, design thinking and the occasional post-mortem. | Engineering write-ups, design thinking and the occasional post-mortem. | ≤ 90 chars | Subheading |
| `showCovers` | true | true | boolean | Show covers |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Keep titles under two lines and excerpts to two lines. Do not add stock photography to the covers.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).

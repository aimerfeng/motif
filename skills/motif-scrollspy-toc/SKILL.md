---
name: motif-scrollspy-toc
description: "An on-this-page outline that highlights the section in view, with an indicator that glides between entries; clicking scrolls smoothly to the section. For docs, long articles and legal pages. Use when the user asks for Scrollspy Outline, 滚动高亮目录, scrollspy, toc, outline, navigation, docs, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scrollspy-toc"
  motif-item: "scrollspy-toc"
  params-hash: "a40e469b"
---

# Scrollspy Outline (滚动高亮目录)

An on-this-page outline that highlights the section in view, with an indicator that glides between entries; clicking scrolls smoothly to the section. For docs, long articles and legal pages.

## When to use

- Docks, bars and menus where motion explains spatial relationships.

## Files

- `assets/scrollspy-toc.tsx` — the component (`ScrollspyToc`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scrollspy-toc`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scrollspy-toc/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ScrollspyToc } from '@/components/motif/scrollspy-toc/scrollspy-toc'

<ScrollspyToc />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `indicator` | glide | glide | glide / instant | Indicator |
| `accent` | #8b5cf6 | #8b5cf6 | color | Accent |
| `offset` | 50 | 50 | 0–160 px (best 20–100) | Set to your sticky header height |
| `smooth` | true | true | boolean | Smooth scroll |
| `spring` | visualDuration 0.35, bounce 0.15 | visualDuration 0.35, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Pass targetRef pointing at the scrolling element (or document); section ids must match item ids and be unique on the page. offsetTop is measured against the offset parent, so make the scroll container position: relative.
- Navigation must stay usable with the keyboard; motion is decoration on top.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).

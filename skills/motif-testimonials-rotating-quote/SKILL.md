---
name: motif-testimonials-rotating-quote
description: "One large quote at a time rises in and out on a timer, above a row of dots where the active one stretches into a pill that fills until the next quote. For landing pages that want one strong voice at a time. Use when the user asks for Rotating Quote, 轮播好评, testimonials, quote, rotating, progress, social proof or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/testimonials-rotating-quote"
  motif-item: "testimonials-rotating-quote"
  params-hash: "31748c85"
---

# Rotating Quote (轮播好评)

One large quote at a time rises in and out on a timer, above a row of dots where the active one stretches into a pill that fills until the next quote. For landing pages that want one strong voice at a time.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/testimonials-rotating-quote.tsx` — the component (`TestimonialsRotatingQuote`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-testimonials-rotating-quote`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/testimonials-rotating-quote/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { TestimonialsRotatingQuote } from '@/components/motif/testimonials-rotating-quote/testimonials-rotating-quote'

<TestimonialsRotatingQuote />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `interval` | 5 | 5 | 3–10 s (best 4–7) | Quote duration |
| `easing` | 0.22, 1, 0.36, 1 | 0.22, 1, 0.36, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Quote easing |
| `accent` | #7c8cff | #7c8cff | color | Progress color |
| `quoteSize` | 36 | 36 | 24–48 px | Shrinks on narrow screens |
| `avatarSize` | 48 | 48 | 36–64 px | Avatar size |
| `barWidth` | 50 | 50 | 32–96 px | Bar width |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).

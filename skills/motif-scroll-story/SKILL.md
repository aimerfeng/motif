---
name: motif-scroll-story
description: "The stage stays pinned while the section scrolls, and four chapters change with scroll progress: copy rises and falls away, the counter rolls, and 24 dots regroup from a scatter into streams, a traced ring and finally a bar chart. Scrolling back plays it in reverse, with an adjustable catch-up lag. Use when the user asks for Scroll Story, 滚动叙事, scroll, pinned, sticky, scrub, storytelling, stagger, svg or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/inter-tight, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scroll-story"
  motif-item: "scroll-story"
  params-hash: "29d72551"
---

# Scroll Story (滚动叙事)

The stage stays pinned while the section scrolls, and four chapters change with scroll progress: copy rises and falls away, the counter rolls, and 24 dots regroup from a scatter into streams, a traced ring and finally a bar chart. Scrolling back plays it in reverse, with an adjustable catch-up lag.

## When to use

- A "how it works" or product-story section on a landing page: three to five steps that are easier to show than to list. Use one per page; it takes several screens of scroll.

## Files

- `assets/scroll-story.tsx` — the component (`ScrollStory`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scroll-story`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/inter-tight @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scroll-story/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/inter-tight';` to the global stylesheet.
4. Use it:

```tsx
import { ScrollStory } from '@/components/motif/scroll-story/scroll-story'

<ScrollStory />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eyebrow` | How Halyard works | How Halyard works | ≤ 32 chars | Eyebrow |
| `accent` | #ffb547 | #ffb547 | color | Accent |
| `tone` | dark | dark | dark / light | Tone |
| `font` | serif | serif | serif / grotesk / sans | Heading font |
| `layout` | right | right | right / left | Visual side |
| `pace` | 1 | 1 | 0.5–2 x (best 0.7–1.5) | In screen heights: 1 means one screen per chapter |
| `smooth` | 0.4 | 0.4 | 0–1.5 s (best 0.15–0.8) | 0 follows the scrollbar exactly; higher values catch up more softly |
| `ease` | 0.65, 0, 0.35, 1 | 0.65, 0, 0.35, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `stagger` | 0.35 | 0.35 | 0–0.7 (best 0.1–0.5) | How much later the rightmost dot starts than the leftmost, as a share of one change |

## Rules

- The section is several screens tall and its stage is position: sticky; no ancestor between it and the scroll container may set overflow: hidden, or the pin breaks.
- Progress is measured from the stage against the section, so it works inside any scroll container (the window or an overflow-y-auto element).
- Each change holds still at both ends so the copy can be read; keep chapter titles to one short sentence and bodies under about 140 characters.
- Under reduced motion nothing is pinned or scrubbed: the chapters render one after another, each with its still figure.
- The dot layouts cycle every four chapters; with a different chapter count pass your own chapters and keep the visual meaning loose.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

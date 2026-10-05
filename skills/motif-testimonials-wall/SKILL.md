---
name: motif-testimonials-wall
description: "Twelve customer quotes in three columns that drift in opposite directions and fade at the edges, or two horizontal rows. Avatars are gradient initials, no images. Use when the user asks for Wall of Love, 好评墙, testimonials, wall of love, marquee, reviews, social proof or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/testimonials-wall"
  motif-item: "testimonials-wall"
  params-hash: "fa7e359b"
---

# Wall of Love (好评墙)

Twelve customer quotes in three columns that drift in opposite directions and fade at the edges, or two horizontal rows. Avatars are gradient initials, no images.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/testimonials-wall.tsx` — the component (`TestimonialsWall`); the tuned values are baked into its `defaults` object
- `assets/testimonials-wall.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-testimonials-wall`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/testimonials-wall/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { TestimonialsWall } from '@/components/motif/testimonials-wall/testimonials-wall'

<TestimonialsWall />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `rating` | 4.9 from 2,300 teams | 4.9 from 2,300 teams | ≤ 32 chars | Rating line |
| `heading` | Engineers say it better than we do | Engineers say it better than we do | ≤ 60 chars | Heading |
| `subline` | A few notes from the teams who run their releases on it every day. | A few notes from the teams who run their releases on it every day. | ≤ 120 chars | Subline |
| `accent` | #f5a524 | #f5a524 | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 18 | 18 | 0–30 px (best 6–26) | Card radius |
| `layout` | columns | columns | columns / rows | Layout |
| `duration` | 60 | 60 | 20–140 s (best 35–90) | Loop duration |
| `pauseOnHover` | true | true | boolean | Pause on hover |

## Rules

- Quotes are short (one to three sentences), specific and attributable to an invented person with a role and company. No generic praise.
- Neighboring columns move in opposite directions; keep all rows at similar speed so the wall reads as calm, not busy.
- Only some cards carry a metric chip; if every card has one, none of them stand out.
- Never use real people, real company names or real avatars; avatars are gradient initials.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

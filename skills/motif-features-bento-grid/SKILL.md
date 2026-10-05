---
name: motif-features-bento-grid
description: "Five feature cards of different sizes in a bento layout, each holding a miniature product UI drawn in JSX: live cursors, a command palette, a diff, integration tiles and a bar chart. Use when the user asks for Bento Feature Grid, 便当格功能区, features, bento, grid, cards, product ui, saas or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/features-bento-grid"
  motif-item: "features-bento-grid"
  params-hash: "54cd74d4"
---

# Bento Feature Grid (便当格功能区)

Five feature cards of different sizes in a bento layout, each holding a miniature product UI drawn in JSX: live cursors, a command palette, a diff, integration tiles and a bar chart.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/features-bento-grid.tsx` — the component (`FeaturesBentoGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-features-bento-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/features-bento-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { FeaturesBentoGrid } from '@/components/motif/features-bento-grid/features-bento-grid'

<FeaturesBentoGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eyebrow` | Why teams switch | Why teams switch | ≤ 28 chars | Eyebrow |
| `heading` | One workspace for the whole decision trail | One workspace for the whole decision trail | ≤ 64 chars | Heading |
| `subline` | Docs, comments and history live together, so nobody has to ask where that call was made. | Docs, comments and history live together, so nobody has to ask where that call was made. | ≤ 140 chars | Subline |
| `accent` | #8b7bff | #8b7bff | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 22 | 22 | 0–36 px (best 8–30) | Card radius |
| `layout` | bento | bento | bento / mirrored | Arrangement |

## Rules

- Each card is one idea: a short title, one sentence, and a small live-looking UI. Do not add screenshots or stock photos.
- Keep one wide card per row of the bento; the rest span two columns so the grid stays balanced.
- Card visuals use the accent color for the single thing to look at; everything else stays neutral.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from karthikmudunuri/eldoraui).

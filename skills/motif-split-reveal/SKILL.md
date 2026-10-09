---
name: motif-split-reveal
description: "A headline split by line, word or character rises out of masks one piece after another with a slight tilt, then exits in order. Lines are measured at the current width and re-split when it changes. Works for Chinese and English; made for editorial hero headlines and section openers. Use when the user asks for Split Reveal, 分行揭示, text, split, reveal, mask, stagger, headline, editorial or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/inter-tight, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/split-reveal"
  motif-item: "split-reveal"
  params-hash: "1cdc4b1e"
---

# Split Reveal (分行揭示)

A headline split by line, word or character rises out of masks one piece after another with a slight tilt, then exits in order. Lines are measured at the current width and re-split when it changes. Works for Chinese and English; made for editorial hero headlines and section openers.

## When to use

- A hero headline or a section opener that should feel composed rather than flashy. Use it once per view, on short text (one to three lines).

## Files

- `assets/split-reveal.tsx` — the component (`SplitReveal`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-split-reveal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/inter-tight @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/split-reveal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/inter-tight';` to the global stylesheet.
4. Use it:

```tsx
import { SplitReveal } from '@/components/motif/split-reveal/split-reveal'

<SplitReveal />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Every frame should earn its place on the page. | Every frame should earn its place on the page. | ≤ 90 chars | Text |
| `split` | lines | lines | lines / words / chars | Split by |
| `stagger` | 0.12 | 0.12 | 0.01–0.3 s (best 0.03–0.18) | Delay between neighbouring pieces |
| `duration` | 1 | 1 | 0.4–2 s (best 0.6–1.4) | Duration |
| `ease` | 0.16, 1, 0.3, 1 | 0.16, 1, 0.3, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `rotate` | 6 | 6 | 0–20 deg (best 0–10) | Rotation each piece starts from |
| `loop` | true | true | boolean | When off, it reveals once and stays |
| `font` | serif | serif | serif / grotesk / sans | Font |
| `size` | 76 | 76 | 28–96 px (best 44–88) | Size |
| `color` | #f1ead8 | #f1ead8 | color | Text |
| `background` | #13241d | #13241d | color | Background |

## Rules

- The full sentence is exposed to screen readers once (aria-label); the split pieces are hidden from them.
- Lines are measured after layout, so give the text a width constraint (max-width in ch or em) for a deliberate rag.
- Keep the tilt small (under 10 degrees) for text people need to read; larger tilts suit display words only.
- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

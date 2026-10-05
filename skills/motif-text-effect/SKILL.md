---
name: motif-text-effect
description: "Text reveals word by word or letter by letter with blur-focus, rise, scale or fade entrances, and folds back in reverse on exit. Made for headlines, quotes and hero copy. Use when the user asks for Text Effect, 文字入场, text, reveal, stagger, blur, headline, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-effect"
  motif-item: "text-effect"
  params-hash: "a72c6bdd"
---

# Text Effect (文字入场)

Text reveals word by word or letter by letter with blur-focus, rise, scale or fade entrances, and folds back in reverse on exit. Made for headlines, quotes and hero copy.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-effect.tsx` — the component (`TextEffect`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-effect`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-effect/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TextEffect } from '@/components/motif/text-effect/text-effect'

<TextEffect />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Craft the details people feel but never notice. | Craft the details people feel but never notice. | ≤ 120 chars | Text |
| `preset` | fade-in-blur | fade-in-blur | fade-in-blur / blur / slide / scale / fade | Entrance |
| `per` | word | word | word / char | Split by |
| `speedReveal` | 0.7 | 0.7 | 0.3–3 x (best 0.6–2) | Higher values shorten the gap between segments |
| `speedSegment` | 1 | 1 | 0.4–3 x (best 0.6–2) | Higher values finish each word or letter faster |
| `delay` | 0 | 0 | 0–2 s | Start delay |
| `blur` | 12 | 12 | 0–24 px (best 4–16) | Applies to the blur entrances |
| `distance` | 20 | 20 | 0–60 px (best 8–32) | Applies to the rise entrances |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).

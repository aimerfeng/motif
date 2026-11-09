---
name: motif-text-highlighter
description: "Marks a phrase the way a pen would: a rough highlighter swipe, underline, box, circle, strike-through, cross-out or bracket drawn on over a few hundred milliseconds, following the text across line wraps. For key words in landing copy, docs and onboarding. Use when the user asks for Hand-Drawn Highlighter, 手绘标注, text, highlight, annotation, hand-drawn, underline, svg or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/newsreader, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-highlighter"
  motif-item: "text-highlighter"
  params-hash: "bdb2227f"
---

# Hand-Drawn Highlighter (手绘标注)

Marks a phrase the way a pen would: a rough highlighter swipe, underline, box, circle, strike-through, cross-out or bracket drawn on over a few hundred milliseconds, following the text across line wraps. For key words in landing copy, docs and onboarding.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-highlighter.tsx` — the component (`Highlighter`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-highlighter`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/newsreader clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-highlighter/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { Highlighter } from '@/components/motif/text-highlighter/text-highlighter'

<Highlighter />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `action` | highlight | highlight | highlight / underline / box / circle / strike-through / crossed-off / bracket | Action |
| `color` | #ffd1dc | #ffd1dc | color | Color |
| `strokeWidth` | 1.5 | 1.5 | 0.5–5 px (best 1–3) | Highlight follows the text height and ignores this |
| `animationDuration` | 600 | 600 | 150–2500 ms (best 300–1200) | Draw duration |
| `iterations` | 2 | 2 | 1–3 | Iterations |
| `padding` | 2 | 2 | 0–10 px | Padding |
| `roughness` | 1 | 1 | 0–2.5 (best 0.5–1.6) | Roughness |
| `multiline` | true | true | boolean | Annotate each line separately when the text wraps |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

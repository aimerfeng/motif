---
name: motif-aurora-text
description: "A few colors drift slowly through the letterforms over a soft glow of the same hues, like an aurora crossing the night sky. Made for the one word in a hero headline people should remember. Use when the user asks for Aurora Text, 极光文字, text, gradient, aurora, headline, glow, css or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/aurora-text"
  motif-item: "aurora-text"
  params-hash: "a483901e"
---

# Aurora Text (极光文字)

A few colors drift slowly through the letterforms over a soft glow of the same hues, like an aurora crossing the night sky. Made for the one word in a hero headline people should remember.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/aurora-text.tsx` — the component (`AuroraText`); the tuned values are baked into its `defaults` object
- `assets/aurora-text.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-aurora-text`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/aurora-text/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/bricolage-grotesque';` to the global stylesheet.
4. Use it:

```tsx
import { AuroraText } from '@/components/motif/aurora-text/aurora-text'

<AuroraText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | northern lights | northern lights | ≤ 40 chars | Text |
| `colors` | #7cf0bd, #2fd4c8, #3b9cf0, #9b7bf0 | #7cf0bd, #2fd4c8, #3b9cf0, #9b7bf0 | 2–6 colors | Laid out in order as a gradient that wraps back to the first color |
| `speed` | 1 | 1 | 0.25–3 x (best 0.5–1.8) | Flow speed |
| `angle` | 120 | 120 | 60–180 deg (best 90–160) | Gradient angle |
| `stretch` | 200 | 200 | 150–400 % (best 180–320) | Longer gradients show fewer colors at once, with softer blends |
| `glow` | 0.35 | 0.35 | 0–0.8 (best 0–0.55) | A blurred copy of the colors behind the text; 0 turns it off |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

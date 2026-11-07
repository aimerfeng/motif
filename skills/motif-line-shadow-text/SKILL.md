---
name: motif-line-shadow-text
description: "A heavy headline casts an offset shadow drawn in fine diagonal hatching that drifts slowly, like a screen-printed shade. Suits poster-style headlines, event names and sporty or editorial cover type. Use when the user asks for Line Shadow Text, 斜线投影文字, text, shadow, hatching, stripes, headline, retro, css or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/syne, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/line-shadow-text"
  motif-item: "line-shadow-text"
  params-hash: "072c8337"
---

# Line Shadow Text (斜线投影文字)

A heavy headline casts an offset shadow drawn in fine diagonal hatching that drifts slowly, like a screen-printed shade. Suits poster-style headlines, event names and sporty or editorial cover type.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/line-shadow-text.tsx` — the component (`LineShadowText`); the tuned values are baked into its `defaults` object
- `assets/line-shadow-text.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-line-shadow-text`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/syne clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/line-shadow-text/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/syne';` to the global stylesheet.
4. Use it:

```tsx
import { LineShadowText } from '@/components/motif/line-shadow-text/line-shadow-text'

<LineShadowText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Long run | Long run | ≤ 40 chars | Text |
| `shadowColor` | #ff6a3d | #ff6a3d | color | Hatch color |
| `offset` | 7 | 7 | 2–14 % (best 4–10) | How far the shadow sits down and to the right, as a percentage of the font size |
| `spacing` | 6 | 6 | 3–12 % (best 4–9) | Distance between hatch lines, as a percentage of the font size |
| `thickness` | 22 | 22 | 10–45 % (best 14–32) | How much of each gap the line fills |
| `direction` | back | back | back / forward | Hatch direction |
| `speed` | 1 | 1 | 0–3 (best 0.3–1.8) | Lines passed per second; 0 holds still |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

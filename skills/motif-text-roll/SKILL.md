---
name: motif-text-roll
description: "On hover each letter tips over like a small cube, one after another, to reveal a second copy in another color, then rolls back when the pointer leaves; a sliding version is included. Made for nav links, buttons and big menus. Use when the user asks for Text Roll, 逐字翻滚, text, hover, roll, 3d, menu, link, stagger, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/inter-tight, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-roll"
  motif-item: "text-roll"
  params-hash: "61854d2d"
---

# Text Roll (逐字翻滚)

On hover each letter tips over like a small cube, one after another, to reveal a second copy in another color, then rolls back when the pointer leaves; a sliding version is included. Made for nav links, buttons and big menus.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-roll.tsx` — the component (`TextRoll`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-roll`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/inter-tight clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-roll/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';` to the global stylesheet.
4. Use it:

```tsx
import { TextRoll } from '@/components/motif/text-roll/text-roll'

<TextRoll />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Selected work | Selected work | ≤ 40 chars | Text |
| `variant` | roll | roll | roll / slide | Style |
| `direction` | up | up | up / down | Direction |
| `duration` | 0.5 | 0.5 | 0.2–1.2 s (best 0.3–0.8) | Letter duration |
| `stagger` | 0.03 | 0.03 | 0–0.1 s (best 0.01–0.06) | Delay between neighbouring letters |
| `easing` | 0.65, 0, 0.35, 1 | 0.65, 0, 0.35, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `rollColor` | #9cc8ff | #9cc8ff | color | Color of the second copy; match your text color for a plain roll |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).

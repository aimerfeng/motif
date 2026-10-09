---
name: motif-circular-text
description: "A ring of text turns slowly around an ink disc with a fixed arrow in the middle, and spins up when the pointer passes over. Copy is spread evenly around the full circle. A natural fit for availability stamps, scroll hints and back-to-top buttons. Use when the user asks for Circular Text Badge, 环形文字徽章, text, circular, badge, rotate, stamp, svg, portfolio or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/circular-text"
  motif-item: "circular-text"
  params-hash: "b7bc2735"
---

# Circular Text Badge (环形文字徽章)

A ring of text turns slowly around an ink disc with a fixed arrow in the middle, and spins up when the pointer passes over. Copy is spread evenly around the full circle. A natural fit for availability stamps, scroll hints and back-to-top buttons.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/circular-text.tsx` — the component (`CircularText`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-circular-text`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/circular-text/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CircularText } from '@/components/motif/circular-text/circular-text'

<CircularText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | AVAILABLE FOR WORK • BOOKING SPRING 2027 •  | AVAILABLE FOR WORK • BOOKING SPRING 2027 •  | ≤ 64 chars | End with a separator such as a bullet; the text is spread evenly around the ring |
| `center` | arrow | arrow | arrow / dot / ring / none | Center mark |
| `discColor` | #1c1917 | #1c1917 | color | Disc color |
| `textColor` | #d9f26b | #d9f26b | color | Text and mark color |
| `size` | 200 | 200 | 120–320 px (best 140–260) | Diameter |
| `fontSize` | 13 | 13 | 9–18 (best 11–16) | Font size |
| `direction` | clockwise | clockwise | clockwise / counter | Direction |
| `spinDuration` | 22 | 22 | 6–60 s (best 10–40) | Seconds per turn |
| `hoverBoost` | 3 | 3 | 1–6 x (best 1–4) | Speed multiplier under the pointer; 1 disables it |

## Rules

- The text is spread evenly around the ring with textLength, so keep the copy to one phrase repeated or two short phrases separated by a bullet; very long copy gets cramped.
- Pass onClick to render the badge as a button (it then gets an accessible name from the text); otherwise it is a decorative div.
- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).

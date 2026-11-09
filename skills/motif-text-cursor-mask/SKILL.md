---
name: motif-text-cursor-mask
description: "A circular mask follows the pointer and reveals a second line underneath; over the words it swells into a large lens, like a flashlight finding hidden text. For manifestos, studio intros and before/after copy. Use when the user asks for Mask Reveal Text, 遮罩透字, mask, reveal, text, pointer, hover, lens or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-cursor-mask"
  motif-item: "text-cursor-mask"
  params-hash: "72570fcc"
---

# Mask Reveal Text (遮罩透字)

A circular mask follows the pointer and reveals a second line underneath; over the words it swells into a large lens, like a flashlight finding hidden text. For manifestos, studio intros and before/after copy.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/text-cursor-mask.tsx` — the component (`TextCursorMask`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-cursor-mask`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-cursor-mask/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TextCursorMask } from '@/components/motif/text-cursor-mask/text-cursor-mask'

<TextCursorMask />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `frontText` | We make websites. | We make websites. | ≤ 60 chars | Front text |
| `hiddenText` | We make them feel alive. | We make them feel alive. | ≤ 60 chars | Hidden text |
| `idleSize` | 50 | 50 | 20–160 px | Idle size |
| `hoverSize` | 500 | 500 | 200–800 px | Hover size |
| `maskColor` | #000000 | #000000 | color | Mask color |
| `hiddenColor` | #ffffff | #ffffff | color | Falls back to dark or light ink when contrast is too low |
| `softness` | 0 | 0 | 0–60 % | Softness |
| `duration` | 0.5 | 0.5 | 0.1–1.5 s | Follow duration |
| `easing` | 0.34, 1.56, 0.64, 1 | 0.34, 1.56, 0.64, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).

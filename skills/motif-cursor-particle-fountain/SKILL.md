---
name: motif-cursor-particle-fountain
description: "Press and hold a button or area and a fountain of colored bubbles or characters streams out of the pointer, arcing up and spinning away under gravity; a quick click gives a small puff. For like buttons, celebration moments and playful CTAs. Use when the user asks for Cool Mode Fountain, 指尖喷泉, cursor, particles, fountain, click, hold, celebration or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/cursor-particle-fountain"
  motif-item: "cursor-particle-fountain"
  params-hash: "1f3197ac"
---

# Cool Mode Fountain (指尖喷泉)

Press and hold a button or area and a fountain of colored bubbles or characters streams out of the pointer, arcing up and spinning away under gravity; a quick click gives a small puff. For like buttons, celebration moments and playful CTAs.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/cursor-particle-fountain.tsx` — the component (`CoolMode`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-cursor-particle-fountain`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/cursor-particle-fountain/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CoolMode } from '@/components/motif/cursor-particle-fountain/cursor-particle-fountain'

<CoolMode />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `particle` | circle | circle | ≤ 8 chars | "circle" for colored bubbles, or any character or emoji |
| `size` | 0 | 0 | 0–45 px | 0 picks a random size between 15 and 45px |
| `particleCount` | 45 | 45 | 10–80 (best 30–60) | Max particles |
| `speedHorz` | 10 | 10 | 2–16 (best 6–12) | Each particle picks a random speed up to this value |
| `speedUp` | 25 | 25 | 8–35 (best 18–30) | Each particle picks a random speed up to this value |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

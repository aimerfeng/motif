---
name: motif-smooth-cursor
description: "Inside a chosen area the system cursor becomes a rounded arrow that glides after the pointer on a spring, turns to face where it is heading and tucks in slightly when moving fast. For portfolios, product showcases and interactive demos. Use when the user asks for Smooth Cursor, 顺滑光标, cursor, pointer, spring, follow, arrow, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/smooth-cursor"
  motif-item: "smooth-cursor"
  params-hash: "140d79a8"
---

# Smooth Cursor (顺滑光标)

Inside a chosen area the system cursor becomes a rounded arrow that glides after the pointer on a spring, turns to face where it is heading and tucks in slightly when moving fast. For portfolios, product showcases and interactive demos.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/smooth-cursor.tsx` — the component (`SmoothCursor`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-smooth-cursor`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/smooth-cursor/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SmoothCursor } from '@/components/motif/smooth-cursor/smooth-cursor'

<SmoothCursor />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `size` | 28 | 28 | 16–44 px (best 20–34) | Size |
| `color` | #ffffff | #ffffff | color | Fill |
| `outlineColor` | #18181b | #18181b | color | Outline |
| `spring` | visualDuration 0.3, bounce 0.15 | visualDuration 0.3, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Longer trails further behind; more bounce overshoots |
| `turn` | true | true | boolean | The arrow turns toward where it is moving; off keeps it pointing up and left |
| `shrink` | 0.12 | 0.12 | 0–0.3 (best 0–0.2) | How much it tucks in at speed; 0 turns it off |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

---
name: motif-presence-cursors
description: "Collaborators’ cursors drift across a canvas with name tags in their own colors, now and then pausing to type a short message, the way they do in shared design tools. For collaborative product heroes, demos and live-presence UIs. Use when the user asks for Multiplayer Cursors, 多人协作光标, cursor, multiplayer, presence, collaboration, name tag, chat or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/presence-cursors"
  motif-item: "presence-cursors"
  params-hash: "bf1fbcbe"
---

# Multiplayer Cursors (多人协作光标)

Collaborators’ cursors drift across a canvas with name tags in their own colors, now and then pausing to type a short message, the way they do in shared design tools. For collaborative product heroes, demos and live-presence UIs.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/presence-cursors.tsx` — the component (`PresenceCursors`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-presence-cursors`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/presence-cursors/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PresenceCursors } from '@/components/motif/presence-cursors/presence-cursors'

<PresenceCursors />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 3 | 3 | 1–6 (best 2–4) | Collaborators |
| `palette` | #10b981, #f43f5e, #0ea5e9, #f59e0b, #8b5cf6, #6366f1 | #10b981, #f43f5e, #0ea5e9, #f59e0b, #8b5cf6, #6366f1 | 1–6 colors | One color per person, reused in order when there are more people |
| `tagStyle` | soft | soft | soft / solid / pointer | Tag style |
| `cursorSize` | 14 | 14 | 10–24 px | Pointer size |
| `showMessages` | true | true | boolean | Type messages |
| `speed` | 1 | 1 | 0.4–2 (best 0.7–1.4) | Speed |
| `wander` | 0.35 | 0.35 | 0.05–0.7 | How far each cursor strays from its home spot |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).

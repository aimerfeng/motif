---
name: motif-custom-pointer
description: "Inside an area the pointer becomes a branded arrow, a named collaborator cursor, a round “View” badge or a small dot, popping in and out at the edges and squeezing on press. For portfolio grids, collaborative products and galleries. Use when the user asks for Custom Pointer, 自定义指针, cursor, pointer, badge, collaboration, hover, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/custom-pointer"
  motif-item: "custom-pointer"
  params-hash: "50b4f207"
---

# Custom Pointer (自定义指针)

Inside an area the pointer becomes a branded arrow, a named collaborator cursor, a round “View” badge or a small dot, popping in and out at the edges and squeezing on press. For portfolio grids, collaborative products and galleries.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/custom-pointer.tsx` — the component (`CustomPointer`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-custom-pointer`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/custom-pointer/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CustomPointer } from '@/components/motif/custom-pointer/custom-pointer'

<CustomPointer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | badge | badge | badge / tag / arrow / dot | Style |
| `label` | View | View | ≤ 14 chars | Text on the badge and the name tag |
| `color` | #f5f5f4 | #f5f5f4 | color | Color |
| `labelColor` | #0c0a09 | #0c0a09 | color | Text color, also used to outline the arrow and the dot |
| `size` | 22 | 22 | 14–34 px (best 18–28) | Arrow size; the badge and dot scale with it |
| `spring` | visualDuration 0.32, bounce 0.3 | visualDuration 0.32, bounce 0.3 | visualDuration 0.05–4 s, bounce 0–0.9 | How it pops in and out at the edges |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

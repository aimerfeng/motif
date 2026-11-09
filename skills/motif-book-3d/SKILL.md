---
name: motif-book-3d
description: "A hardcover book in CSS 3D whose cover and stack of pages fan open as the pointer moves across it, and close again when it leaves. For ebook and course launches, reports and reading apps. Use when the user asks for 3D Book, 立体书, book, 3d, css 3d, pages, hover, ebook or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/book-3d"
  motif-item: "book-3d"
  params-hash: "778e7631"
---

# 3D Book (立体书)

A hardcover book in CSS 3D whose cover and stack of pages fan open as the pointer moves across it, and close again when it leaves. For ebook and course launches, reports and reading apps.

## When to use

- Showpiece visuals: globes, objects, spatial scenes.

## Files

- `assets/book-3d.tsx` — the component (`InteractiveBook`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-book-3d`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/book-3d/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InteractiveBook } from '@/components/motif/book-3d/book-3d'

<InteractiveBook />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `title` | Notebook | Notebook | ≤ 18 chars | Title |
| `coverColor` | #bb013a | #bb013a | color | Cover color |
| `coverStyle` | band | band | band / full | Cover style |
| `pageCount` | 15 | 15 | 4–15 | Pages |
| `maxOpen` | 165 | 165 | 90–175 deg | Cover max angle |
| `perspective` | 1500 | 1500 | 600–3000 px (best 1000–2200) | Perspective |

## Rules

- Provide a static fallback for low-power devices and reduced motion.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).

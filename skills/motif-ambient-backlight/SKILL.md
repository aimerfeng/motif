---
name: motif-ambient-backlight
description: "Media casts its own colors outward: a blurred, saturated copy glows behind it like a TV ambilight and shifts with the content. For video players, album art and product shots on dark pages. Use when the user asks for Ambient Backlight, 环境背光, backlight, glow, ambilight, svg filter, image or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ambient-backlight"
  motif-item: "ambient-backlight"
  params-hash: "d0650000"
---

# Ambient Backlight (环境背光)

Media casts its own colors outward: a blurred, saturated copy glows behind it like a TV ambilight and shifts with the content. For video players, album art and product shots on dark pages.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/ambient-backlight.tsx` — the component (`Backlight`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ambient-backlight`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ambient-backlight/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Backlight } from '@/components/motif/ambient-backlight/ambient-backlight'

<Backlight />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `blur` | 20 | 20 | 4–48 px | Glow blur |
| `saturation` | 4 | 4 | 1–8 | Saturation |
| `artwork` | aurora | aurora | aurora / sunset / ocean | Demo artwork |
| `artSpeed` | 1 | 1 | 0–3 | Artwork speed |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

---
name: motif-text-perspective-plane
description: "Lines or words sit on a tilted 3D plane and separate in depth, turning with the pointer or scroll so a headline reads like signage seen from below. For editorial heroes, event posters and portfolio covers. Use when the user asks for Perspective Type, 透视字面, text, 3d, perspective, headline, tilt, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/space-grotesk, @fontsource/archivo-black, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-perspective-plane"
  motif-item: "text-perspective-plane"
  params-hash: "23a718c0"
---

# Perspective Type (透视字面)

Lines or words sit on a tilted 3D plane and separate in depth, turning with the pointer or scroll so a headline reads like signage seen from below. For editorial heroes, event posters and portfolio covers.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/perspective-text-3d.tsx` — the component (`PerspectiveText3D`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-perspective-plane`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/space-grotesk @fontsource/archivo-black @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-perspective-plane/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource/archivo-black/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { PerspectiveText3D } from '@/components/motif/text-perspective-plane/perspective-text-3d'

<PerspectiveText3D />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Signals from the far side | Signals from the far side | ≤ 80 chars | Use line breaks when splitting by lines |
| `split` | words | words | words / lines | Split by |
| `driver` | pointer | pointer | pointer / scroll / static | Driver |
| `rotateX` | 8 | 8 | 0–30 deg (best 4–16) | Max rotate X |
| `rotateY` | 10 | 10 | 0–30 deg (best 4–18) | Max rotate Y |
| `depth` | 40 | 40 | 0–120 px (best 20–70) | Depth |
| `perspective` | 800 | 800 | 300–2000 px | Perspective |
| `fontSize` | 64 | 64 | 28–112 px | Font size |
| `color` | #f4f1ea | #f4f1ea | color | Text color |
| `font` | grotesk | grotesk | grotesk / serif / black | Font |

## Rules

- With driver "scroll", pass the scrollable ancestor as `container` when the page does not scroll the window.
- Every segment is aria-hidden and the readable copy is a visually hidden span, so keep the text a single plain string.
- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).

---
name: motif-page-flip-lookbook
description: "An open two-page book whose pages turn with a WebGL fold: drag across the spread to scrub the turn or click either side, with shading that deepens mid-turn and a soft gutter shadow. For lookbooks, magazines and annual-report showcases. Use when the user asks for Page Flip Lookbook, 翻页画册, book, page-flip, lookbook, magazine, carousel, webgl, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/page-flip-lookbook"
  motif-item: "page-flip-lookbook"
  params-hash: "576835ea"
---

# Page Flip Lookbook (翻页画册)

An open two-page book whose pages turn with a WebGL fold: drag across the spread to scrub the turn or click either side, with shading that deepens mid-turn and a soft gutter shadow. For lookbooks, magazines and annual-report showcases.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/page-flip-lookbook.tsx` — the component (`PageFlipLookbook`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/pages.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-page-flip-lookbook`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/page-flip-lookbook/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PageFlipLookbook } from '@/components/motif/page-flip-lookbook/page-flip-lookbook'

<PageFlipLookbook />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `pages` | 8 | 8 | 4–14 | Always even; two pages per spread |
| `flipDuration` | 1.1 | 1.1 | 0.4–2.4 s (best 0.8–1.6) | Flip duration |
| `easing` | 0.45, 0, 0.25, 1 | 0.45, 0, 0.25, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `autoplayInterval` | 1.8 | 1.8 | 0–8 s | 0 turns it off; restarts after you drag or click |
| `pageShade` | 0.3 | 0.3 | 0–0.6 | How dark the turning page gets mid-turn |
| `gutterShadow` | 0.35 | 0.35 | 0–0.8 | Gutter shadow |
| `palette` | #c8793d, #3d5566, #7f9a83, #b4473a | #c8793d, #3d5566, #7f9a83, #b4473a | 2–5 colors | Palette |
| `interaction` | both | both | both / drag / click | Interaction |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).

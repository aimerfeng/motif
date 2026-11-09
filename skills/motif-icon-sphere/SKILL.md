---
name: motif-icon-sphere
description: "Dozens of icon tiles laid out on a Fibonacci sphere that turns slowly, shrinking and fading toward the back. Drag to spin it, click a tile to roll it to the front. Made for integration pages and tech-stack sections. Use when the user asks for Icon Sphere, 图标星球, sphere, icons, cloud, canvas, integrations, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/icon-sphere"
  motif-item: "icon-sphere"
  params-hash: "6e1d6151"
---

# Icon Sphere (图标星球)

Dozens of icon tiles laid out on a Fibonacci sphere that turns slowly, shrinking and fading toward the back. Drag to spin it, click a tile to roll it to the front. Made for integration pages and tech-stack sections.

## When to use

- Showpiece visuals: globes, objects, spatial scenes.

## Files

- `assets/icon-sphere.tsx` — the component (`IconSphere`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-icon-sphere`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/icon-sphere/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { IconSphere } from '@/components/motif/icon-sphere/icon-sphere'

<IconSphere />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 30 | 30 | 12–48 (best 18–40) | Icons repeat when there are fewer icons than tiles |
| `radius` | 100 | 100 | 80–140 px | Radius |
| `tileSize` | 40 | 40 | 28–52 px | Tile size |
| `tileStyle` | glyph | glyph | glyph / badge / number | Tile style |
| `palette` | #60a5fa, #f472b6, #fbbf24, #34d399, #a78bfa, #fb923c, #22d3ee | #60a5fa, #f472b6, #fbbf24, #34d399, #a78bfa, #fb923c, #22d3ee | 1–8 colors | Assigned to the icons in order, cycling when there are more icons than colors |
| `depthFade` | 1 | 1 | 0–1 | 1 matches the original; 0 keeps the back tiles fully opaque |
| `autoRotate` | 1 | 1 | 0–2.5 x (best 0.4–1.8) | Direction and pace follow the pointer’s offset from the center; 0 stops it |
| `dragSensitivity` | 1 | 1 | 0.25–3 x | Drag sensitivity |
| `showControl` | true | true | boolean | Pause button |

## Rules

- Icons are plain data, not React elements: pass `icons` as `{ d, color? }` where `d` is SVG path data in a 24×24 viewBox (filled, evenodd), or pass `images` as same-origin URLs.
- Provide a static fallback for low-power devices and reduced motion.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

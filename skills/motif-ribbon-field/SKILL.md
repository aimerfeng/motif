---
name: motif-ribbon-field
description: "Three cyan, indigo and purple light ribbons undulate through a glowing dot matrix, leaving the left side dark for copy. A hero background for SaaS and developer tools. Use when the user asks for Ribbon Field, 光带点阵, ribbon, waves, dot matrix, glow, webgl, hero, dark or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ribbon-field"
  motif-item: "ribbon-field"
  params-hash: "cfd05981"
---

# Ribbon Field (光带点阵)

Three cyan, indigo and purple light ribbons undulate through a glowing dot matrix, leaving the left side dark for copy. A hero background for SaaS and developer tools.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/ribbon-field.tsx` — the component (`RibbonField`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ribbon-field/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RibbonField } from '@/components/motif/ribbon-field/ribbon-field'

<RibbonField />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 1 | 1 | 0.1–2.5 x (best 0.3–1.8) | Speed |
| `dotSize` | 7 | 7 | 4–14 px (best 5–11) | Grid pitch of the dot matrix |
| `pointerAmount` | 1 | 1 | 0–2 | How far the ribbons drift with the pointer |
| `smoothing` | 0.035 | 0.035 | 0.01–0.12 | Lower is softer |
| `hue` | 0 | 0 | -180–180 deg | Hue |
| `saturation` | 1 | 1 | 0–1.6 | Saturation |
| `brightness` | 1.8 | 1.8 | 0.8–2.4 | Brightness |
| `opacity` | 1 | 1 | 0.3–1 | Opacity |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).

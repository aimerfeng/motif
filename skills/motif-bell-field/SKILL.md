---
name: motif-bell-field
description: "Like a struck bronze bell: verdigris nodal lines drift across dark metal, shock rings ripple out on a timer, the pointer nudges the pattern and foundry embers rise. A backdrop for audio and brand-story pages. Use when the user asks for Bell Field, 钟鸣场, chladni, cymatics, metal, nodal, rings, embers, particles, webgl, background, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/bell-field"
  motif-item: "bell-field"
  params-hash: "1af1c72c"
---

# Bell Field (钟鸣场)

Like a struck bronze bell: verdigris nodal lines drift across dark metal, shock rings ripple out on a timer, the pointer nudges the pattern and foundry embers rise. A backdrop for audio and brand-story pages.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/bell-field.tsx` — the component (`BellField`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/bell-field/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BellField } from '@/components/motif/bell-field/bell-field'

<BellField />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 1 | 1 | 0.2–2.5 x (best 0.4–1.8) | Speed |
| `strikeDuration` | 2400 | 2400 | 1200–5000 ms | How long each strike rings out |
| `pointerAmount` | 1 | 1 | 0–1.6 | Pointer pull |
| `emberAmount` | 1 | 1 | 0–1.5 | Embers |
| `hue` | 0 | 0 | -180–180 deg | Hue |
| `saturation` | 1 | 1 | 0.3–1.6 | Saturation |
| `brightness` | 1.4 | 1.4 | 0.8–2 | Brightness |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).

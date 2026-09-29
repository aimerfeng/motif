---
name: motif-liquid-form
description: "A ray-marched blob of liquid silver at the center, its surface slowly rippling with noise and its reflections following the pointer. A focal point for product heroes. Use when the user asks for Liquid Form, 液态银, raymarching, metal, chrome, webgl, hero, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/liquid-form"
  motif-item: "liquid-form"
  params-hash: "90518470"
---

# Liquid Form (液态银)

A ray-marched blob of liquid silver at the center, its surface slowly rippling with noise and its reflections following the pointer. A focal point for product heroes.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/liquid-form.tsx` — the component (`LiquidForm`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/liquid-form/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LiquidForm } from '@/components/motif/liquid-form/liquid-form'

<LiquidForm />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 1 | 1 | 0–2 x (best 0.2–1.5) | Speed |
| `morph` | 1 | 1 | 0–2 | How much the surface ripples |
| `noiseScale` | 1 | 1 | 0.4–2.5 | Higher values make finer ripples |
| `mouseAmount` | 0.15 | 0.15 | 0–0.4 | Pointer influence |
| `metal` | 1 | 1 | 0.3–1.8 | Metalness |
| `camera` | 5.5 | 5.5 | 4–7 | Camera distance |
| `tintHue` | 220 | 220 | 0–360 deg | Tint hue |
| `tintAmount` | 0 | 0 | 0–1 | Tint amount |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).

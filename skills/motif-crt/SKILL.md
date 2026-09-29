---
name: motif-crt
description: "A curved CRT tube with scanlines, phosphor triads, chromatic fringing and halation. The screen can show a terminal boot log, a film leader countdown, a signal-fault blue screen or an 8-bit arcade title. A backdrop for retro-tech and hacker aesthetics. Use when the user asks for CRT Tube, 弧面显像管, crt, retro, scanlines, terminal, phosphor, glitch, vhs, pixel, webgl, canvas2d, background, variants or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/crt"
  motif-item: "crt"
  params-hash: "6ec63215"
---

# CRT Tube (弧面显像管)

A curved CRT tube with scanlines, phosphor triads, chromatic fringing and halation. The screen can show a terminal boot log, a film leader countdown, a signal-fault blue screen or an 8-bit arcade title. A backdrop for retro-tech and hacker aesthetics.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/crt.tsx` — the component (`Crt`); the tuned values are baked into its `defaults` object
- `assets/screens.ts`
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/crt/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Crt } from '@/components/motif/crt/crt'

<Crt />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | terminal | terminal | terminal / cinematic / blue-screen / arcade | Screen |
| `speed` | 1 | 1 | 0.3–2 x (best 0.5–1.5) | Speed |
| `typeSpeed` | 1 | 1 | 0.3–3 | Terminal screen only |
| `motion` | 1 | 1 | 0–2 | Strength of the rolling bar, scanline drift and flicker |
| `brightness` | 1 | 1 | 0.7–1.5 | Brightness |
| `saturation` | 1 | 1 | 0.3–1.6 | Saturation |
| `hue` | 0 | 0 | -180–180 deg | Hue shift |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).

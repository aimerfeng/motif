---
name: motif-scroll-kinetic-type
description: "A phrase that breathes with scroll: words scale up, open their tracking, lift and gain weight in turn, like a wave running through the line, and run back when you scroll up. For manifesto blocks, brand statements and section breaks. Use when the user asks for Kinetic Scroll Type, 滚动呼吸字, scroll, kinetic, typography, variable-font, stagger, editorial or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/inter-tight, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scroll-kinetic-type"
  motif-item: "scroll-kinetic-type"
  params-hash: "3479f932"
---

# Kinetic Scroll Type (滚动呼吸字)

A phrase that breathes with scroll: words scale up, open their tracking, lift and gain weight in turn, like a wave running through the line, and run back when you scroll up. For manifesto blocks, brand statements and section breaks.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/scroll-kinetic-type.tsx` — the component (`KineticTypeScroll`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scroll-kinetic-type`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/inter-tight clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scroll-kinetic-type/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { KineticTypeScroll } from '@/components/motif/scroll-kinetic-type/scroll-kinetic-type'

<KineticTypeScroll />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `words` | Design moves with intent and breathes on scroll | Design moves with intent and breathes on scroll | ≤ 80 chars | Split into words on spaces |
| `scaleRange` | 0.92, 1.18 | 0.92, 1.18 | 0.8–1.3 | Scale (rest / peak) |
| `trackingRange` | -0.5, 2.5 | -0.5, 2.5 | -2–5 | In px |
| `weightRange` | 380, 800 | 380, 800 | 300–900 | Needs a variable font |
| `liftRange` | 0, -12 | 0, -12 | -24–8 | In px, negative is up |
| `dimRange` | 0.45, 1 | 0.45, 1 | 0.3–1 | Opacity (rest / peak) |
| `stagger` | 0.12 | 0.12 | 0.04–0.2 (best 0.06–0.16) | Scroll progress between neighbouring word peaks |
| `align` | center | center | start / center / end | Align |
| `font` | sans | sans | sans / grotesk / serif | Font |

## Rules

- Pass the scrolling ancestor as `container` when the phrase lives inside an overflow-y-auto element, and give that element position: relative so Motion measures offsets against it.
- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).

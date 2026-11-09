---
name: motif-hero-globe-horizon
description: "An oversized dot-matrix globe rises from the bottom edge like a planet horizon, with arcs crossing its rim under a centered headline and call to action. Built for payments, SaaS and network-company landing pages. Use when the user asks for Globe Horizon Hero, 地平线地球首屏, hero, globe, horizon, webgl, network, landing or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, cobe, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hero-globe-horizon"
  motif-item: "hero-globe-horizon"
  params-hash: "e428282b"
---

# Globe Horizon Hero (地平线地球首屏)

An oversized dot-matrix globe rises from the bottom edge like a planet horizon, with arcs crossing its rim under a centered headline and call to action. Built for payments, SaaS and network-company landing pages.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/hero-globe-horizon.tsx` — the component (`HeroGlobeHorizon`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hero-globe-horizon`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx cobe motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hero-globe-horizon/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { HeroGlobeHorizon } from '@/components/motif/hero-globe-horizon/hero-globe-horizon'

<HeroGlobeHorizon />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `headline` | Settle payouts in 190 countries before lunch | Settle payouts in 190 countries before lunch | ≤ 64 chars | Headline |
| `accent` | #ffb86b | #ffb86b | color | Used by the button, markers and arcs |
| `glowColor` | #5b6cff | #5b6cff | color | Glow color |
| `dark` | true | true | boolean | Dark |
| `globeScale` | 0.75 | 0.75 | 0.5–1.2 (best 0.6–1) | Globe radius as a share of the section width |
| `horizon` | 0.6 | 0.6 | 0.45–0.8 | Where the top of the globe sits, from the top of the section |
| `arcCount` | 6 | 6 | 0–8 | Arcs |
| `rotationSpeed` | 0.08 | 0.08 | 0–0.4 | Radians per second; no auto-rotation under reduced motion |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from shuding/cobe).

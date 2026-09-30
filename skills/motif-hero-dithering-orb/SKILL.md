---
name: motif-hero-dithering-orb
description: "Headline and calls to action on the left, a slowly turning orb of 4×4 dithered pixels on the right with a JSX-drawn trace panel floating over it. Made for developer tools, observability and AI infrastructure landing pages. Use when the user asks for Dithering Orb Hero, 抖动光球首屏, hero, dithering, shader, orb, developer tools, dark or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, @paper-design/shaders-react, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hero-dithering-orb"
  motif-item: "hero-dithering-orb"
  params-hash: "02a1a957"
---

# Dithering Orb Hero (抖动光球首屏)

Headline and calls to action on the left, a slowly turning orb of 4×4 dithered pixels on the right with a JSX-drawn trace panel floating over it. Made for developer tools, observability and AI infrastructure landing pages.

## When to use

- Use as the first screen of a developer-tool or infrastructure landing page. Keep the headline under ten words.

## Files

- `assets/hero-dithering-orb.tsx` — the component (`HeroDitheringOrb`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif @paper-design/shaders-react clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hero-dithering-orb/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { HeroDitheringOrb } from '@/components/motif/hero-dithering-orb/hero-dithering-orb'

<HeroDitheringOrb />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brand` | Halcyon | Halcyon | ≤ 18 chars | Brand name |
| `headline` | Every deploy, traced end to end | Every deploy, traced end to end | ≤ 64 chars | Headline |
| `subline` | Halcyon stitches logs, traces and rollbacks into one timeline, so the 3 a.m. page takes four minutes instead of forty. | Halcyon stitches logs, traces and rollbacks into one timeline, so the 3 a.m. page takes four minutes instead of forty. | ≤ 160 chars | Subline |
| `cta` | Start free trial | Start free trial | ≤ 24 chars | Button label |
| `accent` | #22d3ee | #22d3ee | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 12 | 12 | 0–28 px (best 6–20) | Button radius |
| `layout` | split | split | split / centered | Layout |
| `shape` | swirl | swirl | swirl / sphere / warp / ripple | Orb shape |
| `pixel` | 2 | 2 | 1–6 px (best 1.5–4) | Pixel size |
| `speed` | 0.8 | 0.8 | 0.1–2 (best 0.4–1.4) | Speed |

## Rules

- Keep the orb the single focal graphic: do not add a second shader or a background image next to it.
- Use one accent color; the dithering, badge and button all take it from the accent param.
- Headline and subline are content params, do not hard-code copy inside the component.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).

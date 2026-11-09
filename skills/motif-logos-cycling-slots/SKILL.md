---
name: motif-logos-cycling-slots
description: "A row of slots where each one cycles through invented brand wordmarks on its own beat: the outgoing mark blurs up and away as the next rises in, staggered across columns. A compact trust strip under a hero. Use when the user asks for Cycling Logo Slots, 轮换标志墙, logos, logo carousel, trusted by, wordmarks, social proof, cycling or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/jetbrains-mono, @fontsource-variable/space-grotesk, @fontsource-variable/syne, @fontsource/archivo-black, @fontsource/dm-serif-display, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/logos-cycling-slots"
  motif-item: "logos-cycling-slots"
  params-hash: "344e117b"
---

# Cycling Logo Slots (轮换标志墙)

A row of slots where each one cycles through invented brand wordmarks on its own beat: the outgoing mark blurs up and away as the next rises in, staggered across columns. A compact trust strip under a hero.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/logos-cycling-slots.tsx` — the component (`LogoCarousel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-logos-cycling-slots`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/jetbrains-mono @fontsource-variable/space-grotesk @fontsource-variable/syne @fontsource/archivo-black @fontsource/dm-serif-display @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/logos-cycling-slots/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { LogoCarousel } from '@/components/motif/logos-cycling-slots/logos-cycling-slots'

<LogoCarousel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Used by release teams at 900+ companies | Used by release teams at 900+ companies | ≤ 80 chars | Lead line |
| `columns` | 3 | 3 | 2–5 | Columns |
| `logoStyle` | wordmark | wordmark | wordmark / glyph | Logo style |
| `tone` | dark | dark | dark / light | Tone |
| `logoSize` | 24 | 24 | 18–30 px | Logo size |
| `interval` | 2 | 2 | 1.2–5 s | Interval |
| `stagger` | 0.2 | 0.2 | 0–1 s | Column stagger |
| `blur` | 8 | 8 | 0–16 px | Blur |

## Rules

- The wordmarks are invented. Replace them only with logos you have permission to display; never ship real trademarks without it.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).

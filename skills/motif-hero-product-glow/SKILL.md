---
name: motif-hero-product-glow
description: "A centered headline lit by an accent glow, with a product dashboard drawn in pure JSX and SVG rising underneath, its chart line drawing itself. The dependable first screen for a SaaS site. Use when the user asks for Product Glow Hero, 光晕产品首屏, hero, saas, dashboard mockup, glow, gradient text, launch ui or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hero-product-glow"
  motif-item: "hero-product-glow"
  params-hash: "78791218"
---

# Product Glow Hero (光晕产品首屏)

A centered headline lit by an accent glow, with a product dashboard drawn in pure JSX and SVG rising underneath, its chart line drawing itself. The dependable first screen for a SaaS site.

## When to use

- Use as the top of a SaaS landing page when the product has a UI worth showing. Replace the mockup contents with your own product screens (keep them JSX/SVG, no screenshots).

## Files

- `assets/hero-product-glow.tsx` — the component (`HeroProductGlow`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hero-product-glow`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hero-product-glow/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { HeroProductGlow } from '@/components/motif/hero-product-glow/hero-product-glow'

<HeroProductGlow />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brand` | Ledgerline | Ledgerline | ≤ 18 chars | Brand name |
| `headline` | Invoices that get paid before you follow up | Invoices that get paid before you follow up | ≤ 70 chars | Headline |
| `subline` | Ledgerline reconciles every payment as it lands and nudges late clients for you. Teams collect 9 days faster on average. | Ledgerline reconciles every payment as it lands and nudges late clients for you. Teams collect 9 days faster on average. | ≤ 160 chars | Subline |
| `badge` | Now syncing with 40+ banks | Now syncing with 40+ banks | ≤ 36 chars | Badge text |
| `accent` | #7c6cff | #7c6cff | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `glow` | 0.8 | 0.8 | 0–1 (best 0.4–1) | Glow strength |
| `radius` | 10 | 10 | 0–28 px (best 4–20) | Button radius |
| `layout` | centered | centered | centered / split | Layout |

## Rules

- One accent color drives the glow, chart, active nav and primary button; do not add a second brand color.
- Keep the mockup at least 60% of the section width so it reads as the product, and let it bleed into the bottom fade.
- Headline in one to two lines; the gradient text needs enough contrast against the background.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from launch-ui/launch-ui).

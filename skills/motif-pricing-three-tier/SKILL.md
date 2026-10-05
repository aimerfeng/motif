---
name: motif-pricing-three-tier
description: "Three plans with a monthly/yearly switch and prices that roll to their new value. The recommended tier stands taller with an accent gradient border while the others stay quiet. Use when the user asks for Three-Tier Pricing, 三档定价, pricing, plans, toggle, billing, saas, launch ui or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pricing-three-tier"
  motif-item: "pricing-three-tier"
  params-hash: "7430198c"
---

# Three-Tier Pricing (三档定价)

Three plans with a monthly/yearly switch and prices that roll to their new value. The recommended tier stands taller with an accent gradient border while the others stay quiet.

## When to use

- Use on a dedicated pricing page or as the pricing block of a landing page for a product with three plans.

## Files

- `assets/pricing-three-tier.tsx` — the component (`PricingThreeTier`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pricing-three-tier`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pricing-three-tier/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { PricingThreeTier } from '@/components/motif/pricing-three-tier/pricing-three-tier'

<PricingThreeTier />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Pricing that scales with the work, not the seats | Pricing that scales with the work, not the seats | ≤ 70 chars | Heading |
| `subline` | Start free, upgrade when a project goes live. No per-seat fees on any plan. | Start free, upgrade when a project goes live. No per-seat fees on any plan. | ≤ 130 chars | Subline |
| `currency` | $ | $ | $ / € / £ / ¥ | Currency |
| `billing` | monthly | monthly | monthly / yearly | Default billing |
| `discount` | 20 | 20 | 5–40 % (best 10–30) | Yearly discount |
| `highlight` | pro | pro | starter / pro / team | Only one tier can be highlighted |
| `accent` | #6d7dff | #6d7dff | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 22 | 22 | 0–32 px (best 8–28) | Card radius |

## Rules

- Exactly one tier is highlighted (accent gradient border, filled button, taller card). Never highlight two.
- Keep three tiers with a free or lowest entry tier first; feature lists of 4 to 5 short lines, the same rhythm across cards.
- Yearly prices are the monthly price minus the discount, rounded; show the yearly total under the price.
- Buttons are the only accent-filled element besides the highlighted card; do not color the other tiers.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from launch-ui/launch-ui).

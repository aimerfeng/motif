---
name: motif-pricing-single-plan
description: "A headline with two quiet links to talk to sales or book a demo on the left, and a price card with annual/monthly radio cards and a feature list on the right. For products with a single paid tier. Use when the user asks for Single Plan with Sales Paths, 单一套餐与销售入口, pricing, single plan, billing, radio cards, saas, tremor or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pricing-single-plan"
  motif-item: "pricing-single-plan"
  params-hash: "45089225"
---

# Single Plan with Sales Paths (单一套餐与销售入口)

A headline with two quiet links to talk to sales or book a demo on the left, and a price card with annual/monthly radio cards and a feature list on the right. For products with a single paid tier.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/pricing-single-plan.tsx` — the component (`PricingSinglePlan`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pricing-single-plan`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pricing-single-plan/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { PricingSinglePlan } from '@/components/motif/pricing-single-plan/pricing-single-plan'

<PricingSinglePlan />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `planName` | Professional Plan Subscription | Professional Plan Subscription | ≤ 40 chars | Plan name |
| `price` | 29 | 29 | 5–199 | Annual price / mo |
| `monthlyPrice` | 39 | 39 | 5–249 | Monthly price / mo |
| `billing` | annually | annually | annually / monthly | Default billing |
| `features` | 5 | 5 | 3–5 | Feature rows |
| `showSalesLinks` | true | true | boolean | Show sales links |
| `accent` | #3b82f6 | #3b82f6 | color | Accent color |
| `radius` | 8 | 8 | 0–20 px | Radius |
| `tone` | dark | dark | dark / light | Tone |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).

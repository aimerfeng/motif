---
name: motif-pricing-plan-picker
description: "A narrow plan picker: a monthly/yearly toggle, radio-style plan rows whose prices roll digit by digit when the cycle changes, a popular badge and a seat stepper. For checkout steps and compact pricing pages. Use when the user asks for Plan Picker, 套餐选择卡, pricing, plan picker, checkout, billing toggle, rolling numbers, radio or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pricing-plan-picker"
  motif-item: "pricing-plan-picker"
  params-hash: "b0c1e262"
---

# Plan Picker (套餐选择卡)

A narrow plan picker: a monthly/yearly toggle, radio-style plan rows whose prices roll digit by digit when the cycle changes, a popular badge and a seat stepper. For checkout steps and compact pricing pages.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/pricing-plan-picker.tsx` — the component (`PricingPlanPicker`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pricing-plan-picker`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pricing-plan-picker/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { PricingPlanPicker } from '@/components/motif/pricing-plan-picker/pricing-plan-picker'

<PricingPlanPicker />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Select a Plan | Select a Plan | ≤ 28 chars | Heading |
| `plans` | 3 | 3 | 2–3 | Plans |
| `popularIndex` | 2 | 2 | 0–3 | Which plan shows the Popular badge; 0 hides it |
| `showSeats` | true | true | boolean | Seat stepper |
| `yearlyDiscount` | 20 | 20 | 10–40 % | Yearly discount |
| `currency` | USD | USD | USD / EUR / GBP | Currency |
| `accent` | #7c6cff | #7c6cff | color | Accent |
| `radius` | 16 | 16 | 4–28 px (best 10–24) | Radius |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).

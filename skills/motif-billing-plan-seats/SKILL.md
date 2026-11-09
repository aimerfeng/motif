---
name: motif-billing-plan-seats
description: "A settings billing tab with plan and billing period rows, a seats-used bar, the current cycle as an itemized table with total, the card on file and a spend-cap switch that reveals an amount field and a budget ring. Use when the user asks for Plan, Seats & Invoices, 套餐、席位与账单, billing, settings, seats, invoice, spend cap, plan or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/billing-plan-seats"
  motif-item: "billing-plan-seats"
  params-hash: "bc0c1c49"
---

# Plan, Seats & Invoices (套餐、席位与账单)

A settings billing tab with plan and billing period rows, a seats-used bar, the current cycle as an itemized table with total, the card on file and a spend-cap switch that reveals an amount field and a budget ring.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/billing-plan-seats.tsx` — the component (`BillingPlanSeats`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-billing-plan-seats`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/billing-plan-seats/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { BillingPlanSeats } from '@/components/motif/billing-plan-seats/billing-plan-seats'

<BillingPlanSeats />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `tone` | plain | plain | plain / card | Surface |
| `layout` | split | split | split / stacked | Layout |
| `currency` | USD | USD | USD / EUR / GBP | Currency |
| `seatsUsed` | 5 | 5 | 1–50 | Seats used |
| `seatsTotal` | 25 | 25 | 5–50 | Seats total |
| `showSpendCap` | true | true | boolean | Spend cap on |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).

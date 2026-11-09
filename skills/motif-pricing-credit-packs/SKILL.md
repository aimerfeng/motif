---
name: motif-pricing-credit-packs
description: "Pricing for products sold as credits: three or four packs with price, credit amount, bonus and the rate per thousand credits, the best one lifted out. An estimator on top takes a job type and a monthly volume, then shows which pack covers a month and how long each one lasts. For AI tools, render services, API platforms and marketplaces. Use when the user asks for Credit Packs, 积分包定价, pricing, credits, top up, usage based, estimator, calculator, ai or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pricing-credit-packs"
  motif-item: "pricing-credit-packs"
  params-hash: "8cab2de4"
---

# Credit Packs (积分包定价)

Pricing for products sold as credits: three or four packs with price, credit amount, bonus and the rate per thousand credits, the best one lifted out. An estimator on top takes a job type and a monthly volume, then shows which pack covers a month and how long each one lasts. For AI tools, render services, API platforms and marketplaces.

## When to use

- Use on the pricing page of a product billed from a prepaid credit balance: AI generation, rendering, transcription, API calls or marketplace listings. Replace PACKS, PRICES and JOBS with your own numbers; every rate, saving and runway on the page is computed from them.
- Wire onBuy to your checkout; onEstimateChange reports the job type and monthly volume if you want to prefill the purchase.

## Files

- `assets/pricing-credit-packs.tsx` — the component (`PricingCreditPacks`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pricing-credit-packs`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pricing-credit-packs/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { PricingCreditPacks } from '@/components/motif/pricing-credit-packs/pricing-credit-packs'

<PricingCreditPacks />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Pay per render, in packs that never expire | Pay per render, in packs that never expire | ≤ 64 chars | Heading |
| `accent` | #f2b544 | #f2b544 | color | Coins, the featured pack, the main button and the estimator; button ink follows its luminance |
| `tone` | dark | dark | dark / light | Tone |
| `radius` | 18 | 18 | 0–28 px (best 8–24) | Corner radius |
| `packs` | 4 | 4 | 3–4 | Three drops the largest Volume pack |
| `highlightPack` | production | production | none / starter / studio / production / volume | Labelled Best value when it has the lowest rate, Most popular otherwise |
| `currency` | usd | usd | usd / eur / gbp / cny | Each currency has its own round prices; rates and savings are recomputed from them |
| `showEstimator` | true | true | boolean | Turning it off also removes the runway bars from the cards |

## Rules

- Every number shown is derived: credits = base + bonus, the rate is price per 1,000 credits, savings compare against the smallest pack and runway = pack credits / (job cost x monthly volume). Never hard-code a displayed figure.
- The estimator recommends the smallest pack that lasts at least a month; if none does, it points at the largest one and says how soon it runs out. Do not recommend a pack that would run out within the month.
- Accent is reserved for coins, the featured pack, the bonus pills, runway fills that cover a month and the primary button. Button ink and accent text are picked by contrast, so any accent stays readable.
- Keep the native range input over the custom track and the radiogroup for job types so keyboard and screen readers work.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

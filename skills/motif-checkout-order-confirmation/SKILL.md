---
name: motif-checkout-order-confirmation
description: "The page right after payment: a copyable order number, a delivery estimate and a four-stage progress line (confirmed, packed, shipped, delivered) sitting at its first stage, items and totals in a collapsible summary, a save-your-details prompt for guest checkouts and a referral card with a copyable code. For storefront thank-you pages. Use when the user asks for Order Confirmation, 下单成功页, order confirmation, thank you page, checkout, receipt, order status, referral, ecommerce or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/checkout-order-confirmation"
  motif-item: "checkout-order-confirmation"
  params-hash: "f3059d0c"
---

# Order Confirmation (下单成功页)

The page right after payment: a copyable order number, a delivery estimate and a four-stage progress line (confirmed, packed, shipped, delivered) sitting at its first stage, items and totals in a collapsible summary, a save-your-details prompt for guest checkouts and a referral card with a copyable code. For storefront thank-you pages.

## When to use

- Use as the page a shopper lands on right after paying. Feed the real order into ORDER (number, items, shipping address, card) and the region table; the delivery estimate and stage notes are plain strings.
- Hide the account prompt for signed-in customers (showAccountPrompt) and wire onCreateAccount to your sign-up endpoint; the referral code comes from your referral programme.

## Files

- `assets/checkout-order-confirmation.tsx` — the component (`CheckoutOrderConfirmation`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-checkout-order-confirmation`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/checkout-order-confirmation/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/bricolage-grotesque';` to the global stylesheet.
4. Use it:

```tsx
import { CheckoutOrderConfirmation } from '@/components/motif/checkout-order-confirmation/checkout-order-confirmation'

<CheckoutOrderConfirmation />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #2f6b4f | #2f6b4f | color | Tick, progress line, primary buttons and the referral card; button ink follows its luminance, and mid tones that reach 4.5:1 with neither ink are deepened |
| `tone` | paper | paper | paper / white / ink | Tone |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `radius` | 14 | 14 | 0–24 px (best 8–18) | Corner radius |
| `layout` | split | split | split / stacked / receipt | Layout |
| `currency` | usd | usd | usd / eur / gbp / jpy | Prices, tax wording and the shipping address switch with the region |
| `showAccountPrompt` | true | true | boolean | For guest checkouts: offer to save the details with a password |
| `showReferral` | true | true | boolean | Referral card |

## Rules

- The progress line always starts at its first stage on this page: the order is confirmed, nothing has been packed yet. Do not animate it forward on a timer.
- Keep the order number and the delivery estimate above the fold on phones; the summary may start collapsed there, the order number may not.
- One primary button per card. The account prompt never blocks the page and must be dismissible.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

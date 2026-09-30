---
name: motif-tidepool-startup-landing
description: "A classic startup site on one page: an orb-decorated hero, six features, a product video block, alternating explainers, review cards, a pricing switch, blog cards, contact and newsletter. Use when the user asks for Startup Landing Site, 创业公司全站落地页, startup, landing, fintech, pricing, blog, contact, light or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource/dm-serif-display, @fontsource/ibm-plex-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/tidepool-startup-landing"
  motif-item: "tidepool-startup-landing"
  params-hash: "4438e6b0"
---

# Startup Landing Site (创业公司全站落地页)

A classic startup site on one page: an orb-decorated hero, six features, a product video block, alternating explainers, review cards, a pricing switch, blog cards, contact and newsletter.

## When to use

- A conventional multi-section startup site for a B2B product: nav, hero, logos, features, video block, two explainers, testimonials, pricing, blog, contact and newsletter, footer.
- Good for early-stage companies who need every standard section on one page. Replace the dashboard, matching and ledger mockups with UI from your own product.

## Files

- `assets/tidepool-startup-landing.tsx` — the component (`TidepoolStartupLanding`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/mockups.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/outfit @fontsource/dm-serif-display @fontsource/ibm-plex-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/tidepool-startup-landing/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { TidepoolStartupLanding } from '@/components/motif/tidepool-startup-landing/tidepool-startup-landing'

<TidepoolStartupLanding />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Tidepool | Tidepool | ≤ 18 chars | Brand name |
| `accent` | #4a6cf7 | #4a6cf7 | color | Accent color |
| `fontPair` | bricolage | bricolage | bricolage / inter / outfit / serif | Font pairing |
| `radius` | 10 | 10 | 2–20 px (best 4–16) | Corner radius |
| `dark` | false | false | boolean | Dark mode |
| `headline` | Reconcile every payout without opening a spreadsheet | Reconcile every payout without opening a spreadsheet | ≤ 90 chars | Best under 60 characters |
| `subhead` | Match bank deposits to marketplace orders, split what each seller is owed and close the month in an afternoon. | Match bank deposits to marketplace orders, split what each seller is owed and close the month in an afternoon. | ≤ 200 chars | Hero sub-headline |

## Rules

- Keep the classic order and rhythm: white sections alternate with a faint tint of the accent color (var(--tint)). Do not add more background colors.
- The accent is the only saturated color. Use it for primary buttons, the icon squares, active nav and the popular pricing ring; keep the rest neutral.
- Feature icons live in soft accent squares that fill on hover. Keep them to one icon per feature and one sentence of copy.
- Pricing is flat and honest: three plans, a monthly/yearly switch, greyed-out lines for what a plan lacks. No "contact us" tier hidden behind fake prices.
- Copy is concrete: real-sounding customer roles, numbers with units and a clear job for the product. No lorem ipsum, no "unlock" or "supercharge".
- No photos, avatars or logos of real people or companies: gradient initials, invented SVG wordmarks and JSX mockups only.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from NextJSTemplates/startup-nextjs).

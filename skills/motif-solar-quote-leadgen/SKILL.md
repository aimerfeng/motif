---
name: motif-solar-quote-leadgen
description: "A lead-gen page for a home-solar installer: a three-step quote form with progress in the hero (address, roof, bill), a slider that redraws the payback curve, install steps, a coverage map, reviews and an FAQ. For any service business that sells through a quote form. Use when the user asks for Solar Quote Lead-Gen, 光伏报价获客页, lead generation, quote form, solar, calculator, multi-step form, faq, service business or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/plus-jakarta-sans, @fontsource-variable/space-grotesk, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/solar-quote-leadgen"
  motif-item: "solar-quote-leadgen"
  params-hash: "43fab809"
---

# Solar Quote Lead-Gen (光伏报价获客页)

A lead-gen page for a home-solar installer: a three-step quote form with progress in the hero (address, roof, bill), a slider that redraws the payback curve, install steps, a coverage map, reviews and an FAQ. For any service business that sells through a quote form.

## When to use

- A single-goal lead-generation page for a service business that sells through a quote: solar, roofing, HVAC, windows, landscaping, movers.
- The hero carries the quote form; every later section (estimator, process, reviews, FAQ) removes a doubt and the final call to action points back to the same form.

## Files

- `assets/solar-quote-leadgen.tsx` — the component (`SolarQuoteLeadgen`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/quote-form.tsx`
- `assets/art.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-solar-quote-leadgen`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/plus-jakarta-sans @fontsource-variable/space-grotesk clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/solar-quote-leadgen/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { SolarQuoteLeadgen } from '@/components/motif/solar-quote-leadgen/solar-quote-leadgen'

<SolarQuoteLeadgen />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Larkfield Solar | Larkfield Solar | ≤ 22 chars | Brand name |
| `headline` | A fixed-price solar quote for your roof in two minutes | A fixed-price solar quote for your roof in two minutes | ≤ 80 chars | Best under 60 characters |
| `accent` | #f59e0b | #f59e0b | color | Accent color |
| `fontPairing` | inter | inter | inter / jakarta / fraunces / grotesk | Font pairing |
| `radius` | 8 | 8 | 0–20 px (best 4–14) | Corner radius |
| `dark` | false | false | boolean | Dark mode |
| `formSteps` | wizard | wizard | wizard / single | Quote form |
| `electricityRate` | 17 | 17 | 10–45 (best 12–35) | Used by the estimator and the payback curve |
| `sunHours` | 4.5 | 4.5 | 3–6.5 (best 3.5–6) | Sets how much each kW produces a year |

## Rules

- Keep one action. The header has only the logo, a phone number and a button that scrolls to the quote form; do not add a navigation menu.
- The quote form asks only what the follow-up needs: address, roof, bill and an email with consent. Add fields to the call-back form, not to the quote.
- The estimator must stay honest: show the assumptions (rate, sun hours, degradation, price rises) next to the curve and say so when payback is longer than 25 years.
- The accent is the only saturated color besides the green check icons and the amber stars. Accent text uses var(--accent-ink), which is darkened or lightened until it is readable.
- Replace the illustration and coverage map with your own SVG, not stock photos; replace the depot names and reviews with real ones (with permission). Never invent testimonials on a live site.
- Submissions are local state only. Wire the form to your own endpoint before shipping.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from arthelokyo/astrowind).

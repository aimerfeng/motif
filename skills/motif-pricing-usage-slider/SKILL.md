---
name: motif-pricing-usage-slider
description: "One frosted pricing card on an aurora backdrop: drag a log-scale usage slider and the price, breakdown and effective rate update live, with volume tiers that get cheaper as you grow. Built for usage-billed APIs and infrastructure. Use when the user asks for Usage Slider Pricing, 用量滑块定价, pricing, usage based, slider, calculator, glass, aurora or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pricing-usage-slider"
  motif-item: "pricing-usage-slider"
  params-hash: "045e0910"
---

# Usage Slider Pricing (用量滑块定价)

One frosted pricing card on an aurora backdrop: drag a log-scale usage slider and the price, breakdown and effective rate update live, with volume tiers that get cheaper as you grow. Built for usage-billed APIs and infrastructure.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/pricing-usage-slider.tsx` — the component (`PricingUsageSlider`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pricing-usage-slider/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { PricingUsageSlider } from '@/components/motif/pricing-usage-slider/pricing-usage-slider'

<PricingUsageSlider />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Pay for the traffic you actually send | Pay for the traffic you actually send | ≤ 64 chars | Heading |
| `subline` | One plan, no seat fees. Slide to your monthly volume and see the bill before you sign up. | One plan, no seat fees. Slide to your monthly volume and see the bill before you sign up. | ≤ 130 chars | Subline |
| `cta` | Start with the Scale plan | Start with the Scale plan | ≤ 30 chars | Button label |
| `currency` | $ | $ | $ / € / £ / ¥ | Currency |
| `basePrice` | 29 | 29 | 9–199 (best 19–99) | Base price |
| `overage` | 1.2 | 1.2 | 0.4–3 (best 0.6–2) | Rate for the 2M to 10M band; the next two bands are cheaper |
| `accent` | #8b7bff | #8b7bff | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `surface` | glass | glass | glass / solid | Card surface |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 28 | 28 | 0–40 px (best 10–36) | Card radius |

## Rules

- One plan only: the slider is the whole pricing story, so do not add tier cards beside it.
- The price must be computed from the same numbers shown in the breakdown (base, included volume, banded rates); never hard-code the displayed total.
- Keep the native range input (transparent, on top of the custom track) so keyboard and screen readers work, and keep aria-valuetext.
- Use the accent for the thumb, fill and the single CTA only; the aurora backdrop derives its second color from the accent.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).

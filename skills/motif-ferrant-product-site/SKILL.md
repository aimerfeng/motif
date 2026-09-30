---
name: motif-ferrant-product-site
description: "An industrial product-company site: announcement bar, a hero with a vector-drawn product, client wordmarks, switchable feature tabs, counting stats, product cards, reviews, service plans and an FAQ, closing on a bold quote block. Use when the user asks for Ferrant Product Site, 工具品牌官网, product, company, hardware, industrial, tabs, pricing, faq, responsive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/plus-jakarta-sans, @fontsource/archivo-black, @fontsource/ibm-plex-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ferrant-product-site"
  motif-item: "ferrant-product-site"
  params-hash: "1aa36a93"
---

# Ferrant Product Site (工具品牌官网)

An industrial product-company site: announcement bar, a hero with a vector-drawn product, client wordmarks, switchable feature tabs, counting stats, product cards, reviews, service plans and an FAQ, closing on a bold quote block.

## When to use

- A marketing site for a hardware or industrial product company: announcement, hero with a product render, logos, platform story, tabbed features, stats, product range, reviews, plans, FAQ, quote CTA.
- Adapt it by replacing the arrays at the top (PLATFORM, TABS, STATS, PRODUCTS, QUOTES, PLANS, FAQS) and redrawing the SVG product illustrations (Driver, Battery, Saw, Charger); keep them driven by var(--accent) so the accent param recolors the products.

## Files

- `assets/ferrant-product-site.tsx` — the component (`FerrantProductSite`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/plus-jakarta-sans @fontsource/archivo-black @fontsource/ibm-plex-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ferrant-product-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { FerrantProductSite } from '@/components/motif/ferrant-product-site/ferrant-product-site'

<FerrantProductSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `name` | Ferrant | Ferrant | ≤ 18 chars | Used in nav, footer, mark and copy |
| `headline` | Cordless tools built for the ninth hour of the day. | Cordless tools built for the ninth hour of the day. | ≤ 70 chars | Headline |
| `accent` | #ee7a14 | #ee7a14 | color | Product body, buttons, ticks and the closing banner follow it |
| `fontPair` | industrial | industrial | industrial / plex / jakarta / geist | Font pairing |
| `radius` | 16 | 16 | 0–28 px (best 6–24) | Corner radius |
| `dark` | false | false | boolean | Dark mode |
| `animate` | true | true | boolean | Entrance and counter animation |

## Rules

- One accent color drives the products, buttons, ticks, the closing banner and the eyebrow rule. Neutrals are warm greys (--bg, --bg-2, --card); do not introduce a second hue.
- Headings use the head font with --head-weight and --head-track (heavy display faces get weight 400 and tighter tracking); labels and specs use the mono font at 10–12px uppercase.
- Product images are SVG built from gradients on --accent, dark grey and steel, always with a soft floor shadow. Never add photographs, real product shots or brand marks.
- Feature tabs swap with a short fade-slide (250ms) using AnimatePresence; stats count up once when scrolled into view. No other looping motion except the gentle float on the hero product and its spec chips.
- Keep at most one filled accent button per viewport, secondary actions are outlined. Announcement bar is dark (--fg on --bg inverted) and dismissible.
- Copy uses real specs: torque, minutes, kilograms, years. Client names are invented SVG wordmarks.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mearashadowfax/ScrewFast).

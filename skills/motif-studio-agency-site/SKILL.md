---
name: motif-studio-agency-site
description: "A dark design-and-engineering studio site: a hero with a beam-lit product mock, client wordmarks, a services bento, a diagonal process band, case studies, engagement pricing, a journal and an FAQ. Says who you are, what you shipped and how to hire you in one page. Use when the user asks for Studio Agency, 工作室官网, agency, studio, dark, bento, pricing, case-studies, faq, landing or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource-variable/plus-jakarta-sans, @fontsource-variable/space-grotesk, @fontsource-variable/syne, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/studio-agency-site"
  motif-item: "studio-agency-site"
  params-hash: "922981b2"
---

# Studio Agency (工作室官网)

A dark design-and-engineering studio site: a hero with a beam-lit product mock, client wordmarks, a services bento, a diagonal process band, case studies, engagement pricing, a journal and an FAQ. Says who you are, what you shipped and how to hire you in one page.

## When to use

- A marketing site for a design studio, dev shop, consultancy or any small service business that sells engagements: hero with product visual, logos, services, work, process, pricing, testimonials, journal, FAQ, contact.
- Adapt it by editing the arrays at the top of the component (BRANDS, WORK, SERVICES, STEPS, STATS, QUOTES, PLANS, POSTS, FAQS) and the name/headline params. Keep the section order: it is a proven conversion sequence.

## Files

- `assets/studio-agency-site.tsx` — the component (`StudioAgencySite`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans @fontsource-variable/space-grotesk @fontsource-variable/syne clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/studio-agency-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { StudioAgencySite } from '@/components/motif/studio-agency-site/studio-agency-site'

<StudioAgencySite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `name` | Halftone | Halftone | ≤ 20 chars | Used in nav, footer, mark and copy |
| `headline` | A small studio for products that need to feel finished. | A small studio for products that need to feel finished. | ≤ 80 chars | Headline |
| `accent` | #6d5efc | #6d5efc | color | Beam, buttons, icon chips and cover gradients derive from it |
| `fontPair` | bricolage | bricolage | bricolage / grotesk / outfit / syne | Font pairing |
| `radius` | 20 | 20 | 4–32 px (best 10–28) | Corner radius |
| `dark` | true | true | boolean | Dark mode |
| `animate` | true | true | boolean | Entrance and beam animation |

## Rules

- One accent color drives everything (beam, primary button, icon chips, cover gradients). Surfaces step through --bg, --bg-2, --card, --card-2 with 1px --line borders; never use pure black or white fills.
- Headings use the head font at weight 600 with -0.03em tracking and balanced wrapping; labels use the mono font at 11px, uppercase, 0.2em tracking.
- Primary CTA is a filled accent pill, secondary is an outlined pill; only one filled accent button per viewport.
- The hero visual is built from divs and SVG (MockApp). Replace its content with your own product UI; never add screenshots. Client names are invented SVG wordmarks; do not use real logos.
- Every section fades up once when scrolled into view (22px, 0.65s). Do not add parallax or looping motion other than the hero beam.
- Copy is concrete: numbers, durations, prices and named deliverables. No superlatives.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from matt765/Tailcast).

---
name: motif-saas-dashboard-landing
description: "A dark-first SaaS site: a glowing hero over a product dashboard drawn entirely in JSX, then logos, an eight-up feature grid, three steps, stats, quotes, pricing and FAQ. Use when the user asks for Dashboard SaaS Landing, 发布看板 SaaS 落地页, saas, landing, dark, dashboard, pricing, faq, container queries or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/plus-jakarta-sans, @fontsource-variable/space-grotesk, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/saas-dashboard-landing"
  motif-item: "saas-dashboard-landing"
  params-hash: "464283ea"
---

# Dashboard SaaS Landing (发布看板 SaaS 落地页)

A dark-first SaaS site: a glowing hero over a product dashboard drawn entirely in JSX, then logos, an eight-up feature grid, three steps, stats, quotes, pricing and FAQ.

## When to use

- A full SaaS marketing site for a developer or ops-facing product: navbar, glowing hero with a product mockup, logo wall, feature grid, how-it-works, stats, testimonials, pricing, FAQ, closing CTA and footer.
- Best when the product has a data-dense UI worth showing. Swap the dashboard mockup for a UI that matches your product, built in JSX or SVG, never a bitmap.

## Files

- `assets/saas-dashboard-landing.tsx` — the component (`SaasDashboardLanding`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/mockup.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/plus-jakarta-sans @fontsource-variable/space-grotesk @fontsource/ibm-plex-mono @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/saas-dashboard-landing/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { SaasDashboardLanding } from '@/components/motif/saas-dashboard-landing/saas-dashboard-landing'

<SaasDashboardLanding />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Kestrel | Kestrel | ≤ 18 chars | Brand name |
| `accent` | #7c6cff | #7c6cff | color | Accent color |
| `fontPair` | geist | geist | geist / grotesk / editorial / jakarta | Font pairing |
| `radius` | 10 | 10 | 2–20 px (best 4–16) | Corner radius |
| `dark` | true | true | boolean | Dark mode |
| `headline` | Know a release is healthy before your users tell you | Know a release is healthy before your users tell you | ≤ 90 chars | Best under 60 characters; say what the product does |
| `subhead` | Watch crash rates, latency and error budgets across every deploy, and roll back the ones that go wrong before anyone files a ticket. | Watch crash rates, latency and error budgets across every deploy, and roll back the ones that go wrong before anyone files a ticket. | ≤ 200 chars | Hero sub-headline |

## Rules

- Keep the section order: navbar, hero, logos, features, steps, stats, testimonials, pricing, FAQ, CTA, footer. Remove sections you cannot fill honestly rather than padding them.
- Everything themes through CSS variables set on the root element (themeStyle). Change brand, accent, radius, font pairing and mode through props, not by editing class names.
- Layout responds to the container width (@2xl, @3xl, @5xl variants), so the page works inside any preview width. Do not switch to viewport breakpoints.
- The accent color is used sparingly: primary buttons, the hero glow, small icons, one featured pricing tier. Everything else stays neutral.
- Copy is specific and restrained: real-sounding product names, concrete numbers, no superlatives. Replace the invented logos with your own wordmarks; never use real company logos.
- Never add photos or screenshots; use gradient initials for people and JSX or SVG mockups for product UI.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from launch-ui/launch-ui).

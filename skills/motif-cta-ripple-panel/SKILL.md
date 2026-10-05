---
name: motif-cta-ripple-panel
description: "A rounded panel with concentric rings rising from the bottom and gently breathing, over a faint grid, with a big headline and one main button. Switch to a split layout with an email form. The last conversion push at the end of a page. Use when the user asks for Ripple CTA Panel, 涟漪行动号召面板, cta, call to action, ripple, rings, signup, conversion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/cta-ripple-panel"
  motif-item: "cta-ripple-panel"
  params-hash: "6cb82920"
---

# Ripple CTA Panel (涟漪行动号召面板)

A rounded panel with concentric rings rising from the bottom and gently breathing, over a faint grid, with a big headline and one main button. Switch to a split layout with an email form. The last conversion push at the end of a page.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/cta-ripple-panel.tsx` — the component (`CtaRipplePanel`); the tuned values are baked into its `defaults` object
- `assets/cta-ripple-panel.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-cta-ripple-panel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/cta-ripple-panel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { CtaRipplePanel } from '@/components/motif/cta-ripple-panel/cta-ripple-panel'

<CtaRipplePanel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eyebrow` | Free for 14 days | Free for 14 days | ≤ 26 chars | Eyebrow |
| `heading` | Ship the next release with the whole timeline in view | Ship the next release with the whole timeline in view | ≤ 70 chars | Heading |
| `subline` | Connect your repo in two minutes. Your first trace shows up before the coffee is ready. | Connect your repo in two minutes. Your first trace shows up before the coffee is ready. | ≤ 130 chars | Subline |
| `cta` | Start free trial | Start free trial | ≤ 24 chars | Button label |
| `note` | No card required. Cancel from settings. | No card required. Cancel from settings. | ≤ 60 chars | Small print |
| `accent` | #8b7bff | #8b7bff | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 32 | 32 | 0–48 px (best 12–40) | Panel radius |
| `layout` | centered | centered | centered / split | Layout |
| `rings` | 6 | 6 | 3–9 (best 4–8) | Ring count |
| `speed` | 4 | 4 | 3–14 s (best 3–10) | Breath duration |

## Rules

- One primary action only. The secondary button is quiet (outline) and must never use the accent fill.
- Headline states the outcome in under twelve words; the small print removes a fear (no card, cancel any time).
- Place it right before the footer; do not stack two CTA panels on the same page.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from karthikmudunuri/eldoraui).

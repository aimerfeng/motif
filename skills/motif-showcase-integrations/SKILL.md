---
name: motif-showcase-integrations
description: "A product mark at the center with invented brand tiles drifting along dashed orbits, plus centered and directory-grid layouts. Made for integration and ecosystem sections. Use when the user asks for Integrations Showcase, 集成展示, integrations, orbit, ecosystem, partners, showcase or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/showcase-integrations"
  motif-item: "showcase-integrations"
  params-hash: "8492febc"
---

# Integrations Showcase (集成展示)

A product mark at the center with invented brand tiles drifting along dashed orbits, plus centered and directory-grid layouts. Made for integration and ecosystem sections.

## When to use

- Use to show the ecosystem around a product. Replace the BRANDS array and glyph paths with your own integrations.

## Files

- `assets/showcase-integrations.tsx` — the component (`ShowcaseIntegrations`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-showcase-integrations`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/showcase-integrations/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { ShowcaseIntegrations } from '@/components/motif/showcase-integrations/showcase-integrations'

<ShowcaseIntegrations />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `layout` | split | split | split / center / grid | Layout |
| `tiles` | color | color | color / mono | Tile colors |
| `count` | 10 | 10 | 6–12 | Integrations |
| `rings` | 2 | 2 | 1–3 | Orbit rings |
| `speed` | 1 | 1 | 0.2–3 x (best 0.5–2) | Orbit speed |
| `heading` | Plugs into the tools you already pay for | Plugs into the tools you already pay for | ≤ 60 chars | Heading |
| `subheading` | Two-way sync with your billing, docs, chat and warehouse. Set up in minutes, no glue code. | Two-way sync with your billing, docs, chat and warehouse. Set up in minutes, no glue code. | ≤ 120 chars | Subheading |
| `showLabels` | false | false | boolean | Always show names |
| `animate` | true | true | boolean | Entrance & pulse |

## Rules

- Never use real company logos or trademarks; keep tiles as invented wordmarks or neutral glyphs. Orbit positions are written straight to the DOM from the frame loop.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from karthikmudunuri/eldoraui).

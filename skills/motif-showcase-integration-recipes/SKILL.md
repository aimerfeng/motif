---
name: motif-showcase-integration-recipes
description: "Ready-made automations written as one-line recipe cards: two invented app marks joined by a connector that sends a small packet across on hover, chips that filter by use case or app, and steps that unfold inline from \"Use recipe\". For integration platforms, workflow tools and app marketplaces. Use when the user asks for Integration Recipes, 集成配方, integrations, automation, workflow, recipes, templates, marketplace, filter or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/showcase-integration-recipes"
  motif-item: "showcase-integration-recipes"
  params-hash: "5470c205"
---

# Integration Recipes (集成配方)

Ready-made automations written as one-line recipe cards: two invented app marks joined by a connector that sends a small packet across on hover, chips that filter by use case or app, and steps that unfold inline from "Use recipe". For integration platforms, workflow tools and app marketplaces.

## When to use

- Use on an integrations or templates page to sell concrete app-to-app workflows. Replace the APPS and RECIPES arrays with your own catalog; every recipe names exactly two apps.

## Files

- `assets/showcase-integration-recipes.tsx` — the component (`ShowcaseIntegrationRecipes`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-showcase-integration-recipes`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/showcase-integration-recipes/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { ShowcaseIntegrationRecipes } from '@/components/motif/showcase-integration-recipes/showcase-integration-recipes'

<ShowcaseIntegrationRecipes />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #8b7bff | #8b7bff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `connectorStyle` | beam | beam | beam / dashed / pipe | Connector |
| `radius` | 16 | 16 | 4–24 px (best 10–20) | Corner radius |
| `columns` | 3 | 3 | 2–3 | On wide screens; narrower screens use fewer |
| `showFilters` | true | true | boolean | Show filters |
| `heading` | Start from a recipe, not a blank canvas | Start from a recipe, not a blank canvas | ≤ 64 chars | Heading |
| `subheading` | 140 tested workflows between the apps you already run. Pick one, map two fields, and it fires on the next event. | 140 tested workflows between the apps you already run. Pick one, map two fields, and it fires on the next event. | ≤ 140 chars | Subheading |

## Rules

- Write each recipe as one sentence: "When <event> in <App>, <action> in <App>." Keep it under 14 words; the packet label is a real-looking payload of 9 characters or fewer.
- App marks are invented geometric glyphs on a hue tile; never use real company logos or trademarks.
- Filters are single-select toggle buttons with aria-pressed; "Use recipe" is a disclosure button with aria-expanded and aria-controls.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

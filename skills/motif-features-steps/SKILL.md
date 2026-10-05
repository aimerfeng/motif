---
name: motif-features-steps
description: "A three or four step how-it-works section in horizontal, product-tour or zigzag layouts. The active step advances on its own, each with a hand-drawn preview window. Use when the user asks for How It Works Steps, 使用步骤, steps, how it works, onboarding, process, tour or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/features-steps"
  motif-item: "features-steps"
  params-hash: "c26ba33a"
---

# How It Works Steps (使用步骤)

A three or four step how-it-works section in horizontal, product-tour or zigzag layouts. The active step advances on its own, each with a hand-drawn preview window.

## When to use

- Use below the hero to explain the product in three or four steps. Replace STEPS and the four Mock windows with your own flow.

## Files

- `assets/features-steps.tsx` — the component (`FeaturesSteps`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-features-steps`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/features-steps/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { FeaturesSteps } from '@/components/motif/features-steps/features-steps'

<FeaturesSteps />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `layout` | tour | tour | tour / horizontal / zigzag | Layout |
| `steps` | 4 | 4 | 3–4 | Steps |
| `heading` | From raw data to a shared dashboard in an afternoon | From raw data to a shared dashboard in an afternoon | ≤ 72 chars | Heading |
| `subheading` | Four steps, no consultants, no pipeline to babysit. | Four steps, no consultants, no pipeline to babysit. | ≤ 90 chars | Subheading |
| `showMocks` | true | true | boolean | The tour layout always shows them |
| `autoplay` | true | true | boolean | Auto-advance |
| `interval` | 4 | 4 | 2–8 s (best 3–6) | Step duration |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Keep step titles to four words or fewer and bodies to two lines. Mocks are abstract wireframes, not screenshots.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from markmead/hyperui).

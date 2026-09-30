---
name: motif-faq-accordion
description: "Heading and a small “talk to a person” card on the left, six questions on the right that open with a smooth height transition while the plus turns into an accent-filled cross. Keyboard-friendly, single or multi open. Use when the user asks for FAQ Accordion, 常见问题手风琴, faq, accordion, questions, support, disclosure or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/faq-accordion"
  motif-item: "faq-accordion"
  params-hash: "c14d58a7"
---

# FAQ Accordion (常见问题手风琴)

Heading and a small “talk to a person” card on the left, six questions on the right that open with a smooth height transition while the plus turns into an accent-filled cross. Keyboard-friendly, single or multi open.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/faq-accordion.tsx` — the component (`FaqAccordion`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/faq-accordion/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { FaqAccordion } from '@/components/motif/faq-accordion/faq-accordion'

<FaqAccordion />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Questions teams ask before they switch | Questions teams ask before they switch | ≤ 60 chars | Heading |
| `subline` | The short answers. For anything else, a person will reply. | The short answers. For anything else, a person will reply. | ≤ 110 chars | Subline |
| `contact` | Still unsure? Ask the team | Still unsure? Ask the team | ≤ 36 chars | Contact card text |
| `accent` | #34d399 | #34d399 | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 18 | 18 | 0–30 px (best 6–26) | Card radius |
| `layout` | split | split | split / centered | Layout |
| `allowMultiple` | false | false | boolean | Allow several open |
| `firstOpen` | true | true | boolean | First item open |

## Rules

- Questions are written the way customers ask them, answers start with the answer (Yes, No, or the number) in one to three sentences.
- Use six to eight questions ordered by how often they are asked; put pricing and data questions first.
- Each trigger is a real button with aria-expanded and the panel is a labelled region; keep that if you restyle.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from launch-ui/launch-ui).

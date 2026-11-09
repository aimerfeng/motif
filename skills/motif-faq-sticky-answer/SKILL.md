---
name: motif-faq-sticky-answer
description: "A long, grouped and numbered list of questions on the left and an answer panel on the right that stays pinned while the list scrolls, cross-fading as you click or arrow through; an answer can carry a small diagram, a code block or a link list. Below 860px of container width it folds back into an accordion. Made for dense product FAQs with long answers. Use when the user asks for Split FAQ with Sticky Answer, 左问右答常见问题, faq, sticky, split, tabs, accordion, container queries, help center, docs or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/inter-tight, @fontsource-variable/newsreader, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/faq-sticky-answer"
  motif-item: "faq-sticky-answer"
  params-hash: "a05f6fb7"
---

# Split FAQ with Sticky Answer (左问右答常见问题)

A long, grouped and numbered list of questions on the left and an answer panel on the right that stays pinned while the list scrolls, cross-fading as you click or arrow through; an answer can carry a small diagram, a code block or a link list. Below 860px of container width it folds back into an accordion. Made for dense product FAQs with long answers.

## When to use

- A help-center or pricing-page FAQ with ten or more questions whose answers run to several sentences or need a diagram, code or links. For five or six one-line answers, a plain accordion is lighter.

## Files

- `assets/faq-sticky-answer.tsx` — the component (`FaqStickyAnswer`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-faq-sticky-answer`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/inter-tight @fontsource-variable/newsreader clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/faq-sticky-answer/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/bricolage-grotesque';` to the global stylesheet.
4. Use it:

```tsx
import { FaqStickyAnswer } from '@/components/motif/faq-sticky-answer/faq-sticky-answer'

<FaqStickyAnswer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Answers for teams that ship behind flags | Answers for teams that ship behind flags | ≤ 64 chars | Heading |
| `accent` | #5eead4 | #5eead4 | color | Accent |
| `tone` | dark | dark | dark / light | Tone |
| `font` | sans | sans | sans / serif / grotesk | Heading font |
| `listStyle` | numbered | numbered | numbered / rail / cards | Question list |
| `panelStyle` | card | card | card / outline / tinted | Answer panel |
| `transition` | rise | rise | rise / fade / slide / blur | Rise and slide follow the direction you move in |
| `radius` | 16 | 16 | 0–28 px (best 4–22) | Corner radius |

## Rules

- Write questions the way customers ask them and open each answer with the answer itself (Yes, No, the number), then one or two short paragraphs and at most one extra block.
- The split vs accordion layout is pure CSS container queries (@container on the section, @min-[860px]:), so the first server-rendered paint is already right; JS only measures the width to switch the ARIA pattern: a vertical tablist (Up/Down/Home/End move and select, one tabpanel per answer) when wide, buttons with aria-expanded and labelled regions when narrow. Keep both if you restyle.
- Group questions under two to four short labels (Architecture, Billing, Security); numbering runs across groups and the group name becomes the tag above the answer. The sticky panel only earns its place when the list is clearly taller than the panel, so aim for ten to fourteen questions.
- All answers share one grid cell so the panel keeps the height of the longest one and never jumps; keep answers roughly the same length.
- The panel is position: sticky (top 24px); no ancestor between it and the scroll container may set overflow: hidden.
- Accent text and fills are pushed toward the foreground until they pass contrast, so any accent stays readable on both tones.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

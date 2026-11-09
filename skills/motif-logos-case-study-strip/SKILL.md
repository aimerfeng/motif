---
name: motif-logos-case-study-strip
description: "A row of invented customer wordmarks. Hover, focus or tap one and a panel beneath slides to that customer’s headline result, a one-line quote and a link to the full story; the active mark brightens, the rest dim, and the strip cycles slowly when idle, with a pause button, stopping as soon as someone picks a customer. On narrow screens the marks stay in one swipeable row. Social proof that goes past a logo wall. Use when the user asks for Logo Strip with Case Snippets, 带案例摘要的客户标识, logos, customers, case study, social proof, testimonial, tabs, results or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/syne, @fontsource/archivo-black, @fontsource/dm-serif-display, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/logos-case-study-strip"
  motif-item: "logos-case-study-strip"
  params-hash: "ed170509"
---

# Logo Strip with Case Snippets (带案例摘要的客户标识)

A row of invented customer wordmarks. Hover, focus or tap one and a panel beneath slides to that customer’s headline result, a one-line quote and a link to the full story; the active mark brightens, the rest dim, and the strip cycles slowly when idle, with a pause button, stopping as soon as someone picks a customer. On narrow screens the marks stay in one swipeable row. Social proof that goes past a logo wall.

## When to use

- Use below the hero or before pricing when a plain logo wall is not persuasive enough: each mark carries one measured result, one quote and a link to the full case study. Replace CASES with your own customers.

## Files

- `assets/logos-case-study-strip.tsx` — the component (`LogosCaseStudyStrip`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-logos-case-study-strip`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/syne @fontsource/archivo-black @fontsource/dm-serif-display @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/logos-case-study-strip/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { LogosCaseStudyStrip } from '@/components/motif/logos-case-study-strip/logos-case-study-strip'

<LogosCaseStudyStrip />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Five teams, in their own numbers | Five teams, in their own numbers | ≤ 64 chars | Heading |
| `accent` | #b8f25c | #b8f25c | color | Colors the result, progress line and fills; ink adapts automatically |
| `tone` | dark | dark | dark / light | Tone |
| `panelStyle` | card | card | card / split / minimal | Panel style |
| `logoTone` | mono | mono | mono / accent / chip | Active mark |
| `radius` | 18 | 18 | 0–28 px (best 8–24) | Corner radius |
| `autoplay` | true | true | boolean | Pauses on hover; stops after a pick or keyboard focus, resume with the play button |
| `interval` | 5 | 5 | 4–10 s (best 4–8) | Time per customer |

## Rules

- Never use real company logos or trademarks. The wordmarks are invented; swap in logos you have written permission to show, kept monochrome.
- One number per customer, stated with its unit and time frame ("−38% voluntary churn within two quarters"). Do not round up or mix metric types inside one card.
- Quotes are one or two sentences in the customer’s own words, attributed to a named person and role. No adjectives like "game-changing".
- Keep four to six customers. The strip is a tablist: arrow keys move between marks. Hover pauses the idle cycle; a click, tap, arrow key or keyboard focus stops it until the play button is pressed, so nobody loses the story they are reading.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

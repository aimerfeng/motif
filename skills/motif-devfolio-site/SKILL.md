---
name: motif-devfolio-site
description: "A one-page developer portfolio: an accent-washed hero with a floating code card, then about, an experience timeline, numbered project cards and a contact block. Clean in light, sharp in dark, and one accent color re-themes it all. Use when the user asks for Devfolio, 开发者作品集, portfolio, developer, one-page, timeline, resume, responsive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, @fontsource/ibm-plex-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/devfolio-site"
  motif-item: "devfolio-site"
  params-hash: "0721a062"
---

# Devfolio (开发者作品集)

A one-page developer portfolio: an accent-washed hero with a floating code card, then about, an experience timeline, numbered project cards and a contact block. Clean in light, sharp in dark, and one accent color re-themes it all.

## When to use

- A single-page personal site for a software engineer or maintainer: hero, about, experience, projects, education, contact.
- Adapt it by replacing the arrays at the top of the component (NAV, STATS, JOBS, PROJECTS, SCHOOLS) and the name/headline params; keep section order and rhythm.

## Files

- `assets/devfolio-site.tsx` — the component (`DevfolioSite`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/manrope @fontsource-variable/space-grotesk @fontsource/ibm-plex-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/devfolio-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/manrope';` to the global stylesheet.
4. Use it:

```tsx
import { DevfolioSite } from '@/components/motif/devfolio-site/devfolio-site'

<DevfolioSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `name` | Iris Calder | Iris Calder | ≤ 28 chars | Hero title, header monogram and footer |
| `headline` | Systems engineer building fast, quiet developer tools. | Systems engineer building fast, quiet developer tools. | ≤ 90 chars | Headline |
| `accent` | #0f9d6e | #0f9d6e | color | Buttons, timeline, highlights and the hero wash all derive from it |
| `fontPair` | grotesk | grotesk | grotesk / geist / plex / bricolage | Font pairing |
| `radius` | 14 | 14 | 0–28 px (best 6–22) | Corner radius |
| `dark` | false | false | boolean | Dark mode |
| `animate` | true | true | boolean | Hero staggers in, the rest fade in on scroll |

## Rules

- All colors derive from the accent and the dark flag in themeVars(); never hard-code a second brand color. Use the CSS variables (--accent, --fg, --mut, --line, --card, --bg-alt).
- Keep one accent color. Surfaces alternate between --bg and --bg-alt; cards are --card with a 1px --line border and no heavy shadows except on hover.
- Headings use the head font, body copy the body font, and only labels, dates, chips and code use the mono font.
- Project covers are generated from gradients and SVG; do not add photographs or screenshots. Company and school names must stay fictional.
- Copy stays concrete: real-sounding numbers, verbs, no slogans. Keep bullets to one sentence.
- Section titles use the sticky left column on lg screens; on phones everything stacks in one column at 20px gutters.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from RyanFitzgerald/devportfolio).

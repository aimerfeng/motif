---
name: motif-dockfolio-site
description: "A narrow-column personal page: a headline that blurs in word by word, expandable work history, gradient-cover project cards and a floating magnifying dock with a built-in theme toggle. Quiet, tidy, built for designer-engineers. Use when the user asks for Dockfolio, 程序坞作品集, portfolio, personal, dock, blur-fade, single-column, dark-mode or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/plus-jakarta-sans, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dockfolio-site"
  motif-item: "dockfolio-site"
  params-hash: "65c67b99"
---

# Dockfolio (程序坞作品集)

A narrow-column personal page: a headline that blurs in word by word, expandable work history, gradient-cover project cards and a floating magnifying dock with a built-in theme toggle. Quiet, tidy, built for designer-engineers.

## When to use

- A calm personal portfolio for a designer-engineer, indie maker or consultant: intro, about, work history, education, skills, projects, talks, contact, with a floating dock for navigation.
- Adapt it by editing the JOBS, SCHOOLS, SKILLS, PROJECTS and SPRINTS arrays and the name/headline params. Keep the single 42rem column; the layout is the point.

## Files

- `assets/dockfolio-site.tsx` — the component (`DockfolioSite`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dockfolio-site`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/plus-jakarta-sans @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dockfolio-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { DockfolioSite } from '@/components/motif/dockfolio-site/dockfolio-site'

<DockfolioSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `name` | Noa Lindqvist | Noa Lindqvist | ≤ 28 chars | Name / brand |
| `headline` | Product engineer who sweats the last ten percent of every interface. | Product engineer who sweats the last ten percent of every interface. | ≤ 100 chars | Blurs in word by word |
| `accent` | #e0672a | #e0672a | color | Used sparingly: status dot, timeline, underline and cover gradients |
| `fontPair` | geist | geist | geist / manrope / jakarta / editorial | Font pairing |
| `radius` | 16 | 16 | 0–28 px (best 8–24) | Corner radius |
| `dark` | false | false | boolean | The dock’s sun/moon button toggles it too |
| `animate` | true | true | boolean | Blur-fade entrances |

## Rules

- Stay monochrome: text, borders and buttons are --fg/--bg/--mut/--line. The accent appears only in small places (status dot, timeline dots, link underline, cover gradients).
- Every section fades in with BlurFade (blur 6px, 8px rise, 0.5s); the hero headline blurs in word by word. Do not add other entrance effects.
- The dock is the only navigation: keep five links plus the theme toggle, and keep it centered at the bottom of the viewport with a backdrop blur.
- Logos are generated monograms on a gradient circle and project covers are SVG/gradient compositions; never add photos, real logos or brand marks.
- Work and education rows are expandable buttons (aria-expanded); keep them keyboard operable.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/portfolio).

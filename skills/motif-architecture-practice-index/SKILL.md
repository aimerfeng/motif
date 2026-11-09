---
name: motif-architecture-practice-index
description: "A quiet site for an architecture practice built around a project index: hover a row and its floor plan draws itself in line work beside the table. Filter by typology, open a project to see its section and facts, then a plan atlas, awards and offices. For architecture, interior and landscape studios. Use when the user asks for Architecture Practice, 建筑事务所, architecture, portfolio, index, floor-plan, line-drawing, studio, editorial, svg or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/newsreader, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/architecture-practice-index"
  motif-item: "architecture-practice-index"
  params-hash: "59d7b625"
---

# Architecture Practice (建筑事务所)

A quiet site for an architecture practice built around a project index: hover a row and its floor plan draws itself in line work beside the table. Filter by typology, open a project to see its section and facts, then a plan atlas, awards and offices. For architecture, interior and landscape studios.

## When to use

- A portfolio site for an architecture, interior or landscape practice whose work is best shown as drawings: an index table of projects, a plan that draws itself for the hovered row, a selected-project spread with a section, a plan atlas, awards and offices.
- Adapt it by editing PROJECTS in data.ts (copy, facts, coordinates) and the plan/section builders in drawings.ts. Each project owns one plan builder and one section spec, all in metres.

## Files

- `assets/architecture-practice-index.tsx` — the component (`ArchitecturePracticeIndex`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/line-drawing.tsx`
- `assets/drawings.ts`
- `assets/data.ts`
- `assets/theme.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-architecture-practice-index`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/newsreader @fontsource/ibm-plex-mono @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/architecture-practice-index/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/ibm-plex-sans';` to the global stylesheet.
4. Use it:

```tsx
import { ArchitecturePracticeIndex } from '@/components/motif/architecture-practice-index/architecture-practice-index'

<ArchitecturePracticeIndex />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `studioName` | Arden Vos | Arden Vos | ≤ 24 chars | Used in the nav, the opening statement, the footer wordmark and the email; empty falls back to the default |
| `statement` | is an architecture practice in Rotterdam and Porto. We design libraries, schools and housing, and the public ground between them. | is an architecture practice in Rotterdam and Porto. We design libraries, schools and housing, and the public ground between them. | ≤ 180 chars | Follows the practice name in the opening line: where you work and what you build |
| `accent` | #c8432a | #c8432a | color | Like a red pencil on a drawing: section cuts, entrances, levels and the current project. Text uses a darkened shade when needed |
| `groundTone` | paper | paper | paper / concrete / clay / sage | Ground tone |
| `planLineWeight` | 1.1 | 1.1 | 0.6–2 px (best 0.8–1.6) | Base pen width; cut walls are drawn heavier and furniture lighter from it |
| `fontPairing` | swiss | swiss | swiss / monograph / drafting / journal | Font pairing |
| `showCoordinates` | true | true | boolean | Structural grid bubbles, project latitude and longitude, office coordinates |
| `dark` | false | false | boolean | Dark mode |

## Rules

- The page is ink on a ground tone. The marking color is a red-pencil accent used only for section cuts, entrances, level marks, the active row bar and the selected-project dot; everything else is ink, muted ink and 1px hairlines.
- Drawings follow drafting conventions: cut walls heaviest, partitions at the base weight, furniture and planting light, overhead structure dashed, grid axes dash-dot with lettered bubbles. Keep all three weights derived from planLineWeight.
- Plans are SVG line work built from coordinates in metres, never images. North is up; every plan has a north arrow, a scale bar in metres and the section cut A–A that matches the section in the spread.
- Typography is quiet: one display face for the statement, project titles and footer wordmark; the body face for text; the mono face at 11px uppercase with wide tracking for numbers, coordinates and labels. No bold headlines, no gradients, no shadows.
- The index is a real table: number, project, place, typology, year. Hover or focus previews a plan; click or Enter selects the project and scrolls to its spread. Filters are toggle buttons with aria-pressed and counts.
- Motion is limited to drawing lines in (stroke-dashoffset driven by one progress value) and short color changes. With reduced motion every drawing appears complete.
- Copy is specific and plain: places, years, areas in m², clients and what the building does. No mission statements, no superlatives.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

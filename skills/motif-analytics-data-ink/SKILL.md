---
name: motif-analytics-data-ink
description: "A site for a privacy-first web analytics tool where every section is a chart: a hero of small multiples, claims followed by word-sized sparklines, a slopegraph of load times, definitions in sidenotes and pricing as a plain ruled table. For analytics, research and data products. Use when the user asks for Data-Ink Analytics Site, 数据墨水分析产品站, analytics, tufte, sidenotes, sparklines, small multiples, slopegraph, serif, data, light or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/newsreader, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/analytics-data-ink"
  motif-item: "analytics-data-ink"
  params-hash: "a94dc08b"
---

# Data-Ink Analytics Site (数据墨水分析产品站)

A site for a privacy-first web analytics tool where every section is a chart: a hero of small multiples, claims followed by word-sized sparklines, a slopegraph of load times, definitions in sidenotes and pricing as a plain ruled table. For analytics, research and data products.

## When to use

- A marketing site for an analytics, research or data product that wants to show rather than tell: every section is a chart in the Tufte manner, laid out on the tufte-css column with sidenotes in the margin.
- Swap the sample series in charts.tsx for real numbers from your product; the charts take plain arrays and draw themselves with inline SVG.

## Files

- `assets/analytics-data-ink.tsx` — the component (`AnalyticsDataInk`); the tuned values are baked into its `defaults` object
- `assets/charts.tsx`
- `assets/analytics-data-ink.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-analytics-data-ink`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/newsreader clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/analytics-data-ink/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { AnalyticsDataInk } from '@/components/motif/analytics-data-ink/analytics-data-ink'

<AnalyticsDataInk />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Marginalia | Marginalia | ≤ 18 chars | Brand name |
| `headline` | Web analytics that shows its work | Web analytics that shows its work | ≤ 70 chars | Best under 40 characters |
| `inkColor` | #111111 | #111111 | color | Text and chart lines; falls back to the default ink when it lacks contrast with the paper |
| `highlightColor` | #a8321f | #a8321f | color | Only for the one point or line that matters in each chart |
| `paperTone` | ivory | ivory | ivory / white / newsprint / dark | Paper tone |
| `serifFont` | newsreader | newsreader | newsreader / fraunces / palatino | Serif font |
| `gridlines` | false | false | boolean | Faint reference lines in the charts and between pricing rows |
| `dataSeed` | 1869 | 1869 | seed | Draws a different set of sample data |

## Rules

- Keep the tufte-css geometry: text at 55% of the column, sidenotes and margin notes in the right margin, full-width figures only for small multiples.
- Maximise data ink: no chart frames, no axes unless gridlines are on, no legends. Label lines and values directly at their ends.
- One highlight color, used once per chart for the point or line that carries the claim. Everything else is ink on paper.
- Every claim in the copy carries its evidence inline: a number followed by a word-sized sparkline, with the definition in a sidenote.
- Pricing is a plain ruled table (heavy top and bottom rule, hairline under the header), numbers right-aligned in tabular figures. No cards, badges or gradients.
- Headings are sparse: h1 for the page, italic h2 per section, small caps (newthought) to open a paragraph. Links match the text color and are underlined.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from edwardtufte/tufte-css).

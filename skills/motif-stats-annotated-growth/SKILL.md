---
name: motif-stats-annotated-growth
description: "One growth curve tells the company story. The line draws left to right and pauses at pinned milestones (first customer, Series A, a million users) whose labels pop out on leader lines, while the value at the tip counts up. On phones the notes move into a list under the chart. Made for about, investor and our-story pages. Use when the user asks for Annotated Growth Chart, 带注释的增长曲线, stats, growth, chart, milestones, company story, investors, about or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/stats-annotated-growth"
  motif-item: "stats-annotated-growth"
  params-hash: "caa865c6"
---

# Annotated Growth Chart (带注释的增长曲线)

One growth curve tells the company story. The line draws left to right and pauses at pinned milestones (first customer, Series A, a million users) whose labels pop out on leader lines, while the value at the tip counts up. On phones the notes move into a list under the chart. Made for about, investor and our-story pages.

## When to use

- Use on about, investor and "our story" pages to tell the company history as one growth curve. Replace FIRST_YEAR, KEYS (monthly keyframes), MILESTONES (title plus one-sentence body) and SUBHEADING with your own figures; the value axis maximum and tick step are derived from the peak of the data, so there is nothing else to retune.
- Pass a changing replayKey (for example when the section scrolls into view) to fade the curve out and tell the story again; the heading stays in place.

## Files

- `assets/stats-annotated-growth.tsx` — the component (`StatsAnnotatedGrowth`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-stats-annotated-growth`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/stats-annotated-growth/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { StatsAnnotatedGrowth } from '@/components/motif/stats-annotated-growth/stats-annotated-growth'

<StatsAnnotatedGrowth />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #8f8cff | #8f8cff | color | Accent |
| `curve` | smooth | smooth | smooth / step | Step draws each month as a flat tread, like a monthly ledger |
| `annotationStyle` | callout | callout | callout / label / list | Narrow screens always switch to the numbered list |
| `drawDuration` | 4.5 | 4.5 | 2.5–9 s (best 3.5–7) | Milestone pauses come on top |
| `showGrid` | true | true | boolean | Grid and value axis |
| `valuePrefix` |  |  | ≤ 2 chars | A currency sign such as $ or €. When you switch to a revenue metric, also replace KEYS and MILESTONES in the code with revenue figures and moments |
| `metricLabel` | Monthly active writers | Monthly active writers | ≤ 32 chars | Metric label |
| `heading` | From a 400-person waitlist to 2.4 million writers | From a 400-person waitlist to 2.4 million writers | ≤ 64 chars | Heading |

## Rules

- Milestones must match the metric. If you switch to a currency metric with valuePrefix, rewrite KEYS and every milestone title and body as a revenue story too; never relabel a user-count story as revenue.
- Keep three to five milestones with titles of four words or fewer. Labels search for collision-free spots above the curve, but milestones bunched on the flat start of a hockey stick still need room between them.
- Every milestone month must also be a keyframe in KEYS, so the tip readout lands on the exact figure (1.00M, not 1.02M) while the line pauses there.
- Use real, verifiable numbers: the curve is the claim. Under reduced motion the finished chart is shown at once.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

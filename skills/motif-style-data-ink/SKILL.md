---
name: motif-style-data-ink
description: "Tufte's data-ink rules as an interface style: the Tufte CSS measure and sidenotes, sparklines inside sentences, small multiples on one scale, range-frame axes, direct labels instead of legends, slopegraphs and tables with in-cell bars, and almost no chrome. For reports, analytics pages and research dashboards. Use when the user asks for Data Ink, 数据墨水, tufte, data ink, sparkline, small multiples, slopegraph, range frame, sidenotes, report, analytics or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/ibm-plex-sans, @fontsource-variable/newsreader, @fontsource-variable/playfair-display, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-data-ink"
  motif-item: "style-data-ink"
  params-hash: "cf467149"
---

# Data Ink (数据墨水)

Tufte's data-ink rules as an interface style: the Tufte CSS measure and sidenotes, sparklines inside sentences, small multiples on one scale, range-frame axes, direct labels instead of legends, slopegraphs and tables with in-cell bars, and almost no chrome. For reports, analytics pages and research dashboards.

## When to use

- Use for reports, analytics and research pages, data journalism, internal dashboards that are read rather than operated, and documentation that explains numbers.
- Avoid for marketing pages, consumer apps and anything that needs loud interface chrome.

## Files

- `assets/style-data-ink.tsx` — the component (`DataInk`); the tuned values are baked into its `defaults` object
- `assets/style-data-ink.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-data-ink`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/ibm-plex-sans @fontsource-variable/newsreader @fontsource-variable/playfair-display @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-data-ink/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/playfair-display';`, `@import '@fontsource-variable/playfair-display/wght-italic.css';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { DataInk } from '@/components/motif/style-data-ink/style-data-ink'

<DataInk />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `inkColor` | #111111 | #111111 | color | Text and data lines; darkened or lightened when contrast is too low |
| `highlight` | #b8322a | #b8322a | color | Marks only the one line or point that matters |
| `paperTone` | ivory | ivory | ivory / white / stone / night | Paper |
| `strokeWidth` | 1.25 | 1.25 | 0.75–2.5 px (best 1–2) | Stroke width |
| `serifFont` | newsreader | newsreader | newsreader / fraunces / playfair | Figures always use IBM Plex Mono |
| `gridlines` | false | false | boolean | Faint hairlines at the ticks |
| `density` | 1 | 1 | 0.9–1.1 x (best 0.9–1.1) | Scales the 15px base size |
| `dataSeed` | 7 | 7 | seed | Regenerates the demo figures |

## Rules

- Keep the Tufte CSS page: the article sits at 87.5% width with 12.5% left padding (max 1400px); paragraphs, tables and normal figures are 55% wide; sidenotes and margin notes take the right margin (50% of the paragraph width, pulled out by -60%). Below 760px notes collapse behind a numbered or ⊕ toggle.
- Palette: paper (ivory #fffff8 by default), one ink for text and data, ink mixed with paper for muted text (at least 4.5:1), rules (22%) and gridlines (10%), and exactly one highlight colour used only for the one series, point or row the text talks about. Never colour-code categories; label them.
- Maximise the data-ink ratio: no boxes around charts, no backgrounds, no legends, no 3D, no shadows. Axes are range frames that span only the data and are labelled at the minimum, median and maximum. Gridlines are off by default and, when on, are 10% hairlines.
- Label directly: series names and last values sit at the end of each line, slopegraph labels at both ends, outliers labelled next to the point. Captions live in the margin, set in the serif at 1.1rem.
- Put small charts where the words are: a sparkline (about 4em by 1em, last point in the highlight) follows the number it explains inside the sentence. Compare with small multiples on one shared scale rather than one crowded chart.
- Type: one serif (Newsreader, Fraunces or Playfair Display) at 1.4rem/2rem for text, h1 at 3.2rem regular, h2 and h3 italic, sections opened with small-caps "new thought" words. Every figure is set in IBM Plex Mono with tabular numerals so columns align.
- Tables are booktabs: a rule above and below and a hairline under the header, no vertical lines, numbers right-aligned, an in-cell bar instead of a separate bar chart.
- Chrome is minimal: buttons are text with a hairline border, selectors are words underlined when active. Motion is limited to 150ms colour fades and is removed under reduced motion.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from edwardtufte/tufte-css).

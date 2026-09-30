---
name: motif-features-tabbed-showcase
description: "Four features on the left with a progress line that advances on its own; on the right a gradient stage swaps between JSX-drawn product screens: inbox, reply composer, routing and SLA report. Use when the user asks for Tabbed Feature Showcase, 标签切换功能展示, features, tabs, showcase, autoplay, product ui, saas or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/features-tabbed-showcase"
  motif-item: "features-tabbed-showcase"
  params-hash: "4d6acc52"
---

# Tabbed Feature Showcase (标签切换功能展示)

Four features on the left with a progress line that advances on its own; on the right a gradient stage swaps between JSX-drawn product screens: inbox, reply composer, routing and SLA report.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/features-tabbed-showcase.tsx` — the component (`FeaturesTabbedShowcase`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/features-tabbed-showcase/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { FeaturesTabbedShowcase } from '@/components/motif/features-tabbed-showcase/features-tabbed-showcase'

<FeaturesTabbedShowcase />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eyebrow` | The support desk | The support desk | ≤ 28 chars | Eyebrow |
| `heading` | Answer faster without sounding like a bot | Answer faster without sounding like a bot | ≤ 64 chars | Heading |
| `subline` | Relay keeps the customer’s history next to the reply box, so agents spend their time on people, not tabs. | Relay keeps the customer’s history next to the reply box, so agents spend their time on people, not tabs. | ≤ 150 chars | Subline |
| `accent` | #38bdf8 | #38bdf8 | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 26 | 26 | 0–40 px (best 10–32) | Stage radius |
| `layout` | right | right | right / left | Stage side |
| `autoplay` | true | true | boolean | Autoplay |
| `dwell` | 4.5 | 4.5 | 2–12 s (best 3–8) | Time per feature |

## Rules

- Exactly one feature is open at a time; the open one shows its description and the progress line.
- Every stage panel is JSX or SVG at the same width, so switching never changes the stage height.
- Keep four to five features. Tabs are real buttons (role=tab) and clicking one restarts the autoplay timer from it.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).

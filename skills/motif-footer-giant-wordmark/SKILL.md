---
name: motif-footer-giant-wordmark
description: "Four link columns and a subscribe box above a brand wordmark that fills the whole row: an outlined word with a gradient highlight sweeping across on its own and following the pointer when it passes. A compact variant drops the giant word. Use when the user asks for Giant Wordmark Footer, 巨型字标页脚, footer, wordmark, giant text, text hover, newsletter, links or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/footer-giant-wordmark"
  motif-item: "footer-giant-wordmark"
  params-hash: "f21f9ace"
---

# Giant Wordmark Footer (巨型字标页脚)

Four link columns and a subscribe box above a brand wordmark that fills the whole row: an outlined word with a gradient highlight sweeping across on its own and following the pointer when it passes. A compact variant drops the giant word.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/footer-giant-wordmark.tsx` — the component (`FooterGiantWordmark`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/footer-giant-wordmark/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { FooterGiantWordmark } from '@/components/motif/footer-giant-wordmark/footer-giant-wordmark'

<FooterGiantWordmark />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brand` | halcyon | halcyon | ≤ 14 chars | Also the giant word; shorter looks better |
| `tagline` | Deploy tracing for teams that would rather sleep. Built in Rotterdam, used everywhere. | Deploy tracing for teams that would rather sleep. Built in Rotterdam, used everywhere. | ≤ 110 chars | Tagline |
| `accent` | #22d3ee | #22d3ee | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Giant word font |
| `layout` | giant | giant | giant / compact | Layout |
| `showStatus` | true | true | boolean | Show status pill |
| `sweep` | 0.8 | 0.8 | 0.2–2.5 (best 0.4–1.6) | Sweep speed |

## Rules

- The giant wordmark is decoration: keep it aria-hidden and use the brand name only, never a slogan.
- Four link columns at most, five links each, headed by muted uppercase labels; the legal column always stays.
- Only the highlight uses the accent color; the outline stays neutral so the footer does not outshine the page.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from karthikmudunuri/eldoraui).

---
name: motif-style-editorial
description: "Serif type, italic headings, hairline and double rules, margin notes and a drop cap: the page of a carefully typeset magazine. Paper, ink and one red pencil. For essays, blogs, publications and personal sites. Use when the user asks for Editorial, 杂志编辑, editorial, serif, magazine, tufte, margin notes, typography, tokens, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/newsreader, @fontsource-variable/playfair-display, @fontsource/dm-serif-display, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-editorial"
  motif-item: "style-editorial"
  params-hash: "21847a87"
---

# Editorial (杂志编辑)

Serif type, italic headings, hairline and double rules, margin notes and a drop cap: the page of a carefully typeset magazine. Paper, ink and one red pencil. For essays, blogs, publications and personal sites.

## When to use

- Use for essays, blogs, newsletters, publications, portfolios of writers and designers, and any product where reading is the main activity.
- Avoid for dense dashboards, games or anything that needs loud, saturated interface chrome.

## Files

- `assets/style-editorial.tsx` — the component (`Editorial`); the tuned values are baked into its `defaults` object
- `assets/style-editorial.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-editorial`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/newsreader @fontsource-variable/playfair-display @fontsource/dm-serif-display @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-editorial/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/playfair-display';`, `@import '@fontsource-variable/playfair-display/wght-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { Editorial } from '@/components/motif/style-editorial/style-editorial'

<Editorial />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #b3261e | #b3261e | color | Only for rules, links, the drop cap and hover |
| `ruleWeight` | 1 | 1 | 1–3 px (best 1–2) | Rule weight |
| `radius` | 0 | 0 | 0–8 px (best 0–4) | Corner radius |
| `fontPairing` | instrument | instrument | instrument / playfair / fraunces / dm-serif | Font pairing |
| `measure` | 64 | 64 | 48–76 (best 56–70) | Approximate characters per line |
| `density` | 1 | 1 | 0.85–1.2 x (best 0.9–1.15) | Density |
| `mode` | paper | paper | paper / night | Edition |
| `margin` | true | true | boolean | Margin notes |
| `dropcap` | true | true | boolean | Drop cap |

## Rules

- Palette ratio: about 85% paper ground (a warm off-white tinted 2% by the accent, or a warm near-black in night mode), 10% ink for text and rules, 4% the single accent used like a red pencil (kickers, links, drop cap, active rule, hover), 1% muted tag colors (ochre, rose, sage) used only in badges and tinted panels. Never pure white or pure black; never more than one accent.
- Typography: a display serif for headlines (Instrument Serif, Playfair Display, Fraunces or DM Serif Display) at weight 400 with -0.025em tracking on the display size, and Newsreader for text at 17px / 1.6. Headings are italic, never bold; emphasis is italic. Kickers, labels, buttons and badges are small uppercase text (0.66-0.78rem) with 0.14-0.16em tracking. Set numbers in lining tabular figures.
- Measure: keep running text to 56-70 characters per line. Put explanations in a right-hand margin as numbered side notes at 14px in muted ink, with a hairline above; on narrow screens they fall below the content.
- Rules replace boxes: a 3px ink rule above panels, hairlines between list items, a heavy-over-thin rule under mastheads, a double rule at the end of a page. Controls are rectangles (radius 0-4px) with 1px outlines or solid ink; no shadows, no gradients, no glass.
- Motion is quiet: 200ms ease color and border fades on hover, a 220ms slide on switches. Nothing bounces, scales or parallaxes. Reduced motion removes the transitions.
- Use a drop cap on the first paragraph of an article, one pull quote per screen (italic display serif, accent rule above), and sparklines or small figures with an italic caption for data. Use sidenote markers in accent color.
- Do not use bold headings, sans-serif interface text, pill buttons, drop shadows, gradients, emoji, stock photography placeholders or centered body text.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from edwardtufte/tufte-css).

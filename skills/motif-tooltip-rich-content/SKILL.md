---
name: motif-tooltip-rich-content
description: "Tooltips that carry more than a word: a title with an icon, a small preview image, a stats list (status, coverage, last deploy) or a chart legend with coloured series and values; optional arrow, surface or dark theme. Made for dashboard metrics, toolbar help and chart points. Use when the user asks for Rich Tooltip, 富内容提示气泡, tooltip, hint, stats, legend, popover, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/tooltip-rich-content"
  motif-item: "tooltip-rich-content"
  params-hash: "b72931da"
---

# Rich Tooltip (富内容提示气泡)

Tooltips that carry more than a word: a title with an icon, a small preview image, a stats list (status, coverage, last deploy) or a chart legend with coloured series and values; optional arrow, surface or dark theme. Made for dashboard metrics, toolbar help and chart points.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/tooltip-rich-content.tsx` — the component (`TooltipRichContent`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-tooltip-rich-content`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/tooltip-rich-content/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TooltipRichContent } from '@/components/motif/tooltip-rich-content/tooltip-rich-content'

<TooltipRichContent />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `content` | stats | stats | text / title / icon / image / stats / chart | Content |
| `theme` | surface | surface | surface / dark | Theme |
| `arrow` | true | true | boolean | Arrow |
| `placement` | top | top | top / bottom / left / right | Flips to the opposite side when there is no room |
| `delay` | 0 | 0 | 0–1 s (best 0–0.5) | Open delay |
| `maxWidth` | 280 | 280 | 200–340 px (best 240–320) | Max width |
| `radius` | 6 | 6 | 2–14 px (best 4–10) | Corner radius |

## Rules

- Wrap a single focusable trigger: <TooltipRichContent body={...}><button>…</button></TooltipRichContent>. Pass `body` for your own content; `content` only picks a built-in example.
- Tooltip content is never interactive and is hidden on touch: do not put links or buttons inside, and never hide essential information only here.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).

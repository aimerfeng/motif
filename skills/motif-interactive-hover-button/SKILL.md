---
name: motif-interactive-hover-button
description: "On hover the small dot beside the label floods the whole button with color while the label slides away and the same words return from the right with an arrow. For secondary actions that lead somewhere, like “See what’s new” or “Continue”. Use when the user asks for Interactive Hover Button, 圆点扩散按钮, button, hover, fill, arrow, link, cta or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/interactive-hover-button"
  motif-item: "interactive-hover-button"
  params-hash: "52698fda"
---

# Interactive Hover Button (圆点扩散按钮)

On hover the small dot beside the label floods the whole button with color while the label slides away and the same words return from the right with an arrow. For secondary actions that lead somewhere, like “See what’s new” or “Continue”.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/interactive-hover-button.tsx` — the component (`InteractiveHoverButton`); the tuned values are baked into its `defaults` object
- `assets/interactive-hover-button.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-interactive-hover-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/interactive-hover-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InteractiveHoverButton } from '@/components/motif/interactive-hover-button/interactive-hover-button'

<InteractiveHoverButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | See what’s new | See what’s new | ≤ 24 chars | Label |
| `color` | #6a5cf0 | #6a5cf0 | color | Also the dot color; the revealed label picks light or dark ink from it |
| `icon` | arrow | arrow | arrow / arrow-up-right / chevron / plus | Icon |
| `dotSize` | 8 | 8 | 5–12 px (best 6–10) | Dot size |
| `radius` | 28 | 28 | 6–28 px (best 10–28) | Corner radius |
| `duration` | 0.4 | 0.4 | 0.15–0.8 s (best 0.25–0.55) | Duration |
| `easing` | 0.25, 1, 0.5, 1 | 0.25, 1, 0.5, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

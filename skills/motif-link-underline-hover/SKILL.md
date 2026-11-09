---
name: motif-link-underline-hover
description: "A set of link hover treatments sharing one API: a line that wipes in from one side and leaves through the other, a centre-out stroke with a lift, a double line whose top stroke rises over the word, and an enter-left, exit-right bar. For nav links, footers and inline article links. Use when the user asks for Link Underlines, 链接下划线, link, underline, hover, navigation, css or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/link-underline-hover"
  motif-item: "link-underline-hover"
  params-hash: "df26cefc"
---

# Link Underlines (链接下划线)

A set of link hover treatments sharing one API: a line that wipes in from one side and leaves through the other, a centre-out stroke with a lift, a double line whose top stroke rises over the word, and an enter-left, exit-right bar. For nav links, footers and inline article links.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/link-underline-hover.tsx` — the component (`LinkUnderlineHover`); the tuned values are baked into its `defaults` object
- `assets/link-underline-hover.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-link-underline-hover`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/link-underline-hover/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LinkUnderlineHover } from '@/components/motif/link-underline-hover/link-underline-hover'

<LinkUnderlineHover />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | metis | metis | metis / center / double / bar | Variant |
| `color` | #f5f5f4 | #f5f5f4 | color | Line color |
| `thickness` | 1 | 1 | 1–4 px | Thickness |
| `offset` | 0 | 0 | 0–6 px | Offset |
| `duration` | 0.3 | 0.3 | 0.15–1 s (best 0.25–0.6) | Duration |
| `easing` | 0.25, 0.1, 0.25, 1 | 0.25, 0.1, 0.25, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `lift` | 0 | 0 | 0–4 px | How far the link rises on hover |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).

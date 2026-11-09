---
name: motif-scroll-focus-list
description: "A tall list of large words scrolls inside a frame: the item crossing the centre line lights up and scales while the rest dim and blur, and items swing in from alternating sides. For capability lists, service menus and tech-stack sections. Use when the user asks for Scroll Focus List, 滚动聚焦列表, scroll, list, focus, typography, spring, reveal or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/inter-tight, @fontsource-variable/space-grotesk, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scroll-focus-list"
  motif-item: "scroll-focus-list"
  params-hash: "5600cf8f"
---

# Scroll Focus List (滚动聚焦列表)

A tall list of large words scrolls inside a frame: the item crossing the centre line lights up and scales while the rest dim and blur, and items swing in from alternating sides. For capability lists, service menus and tech-stack sections.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/scroll-focus-list.tsx` — the component (`ScrollFocusList`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scroll-focus-list`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/inter-tight @fontsource-variable/space-grotesk clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scroll-focus-list/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { ScrollFocusList } from '@/components/motif/scroll-focus-list/scroll-focus-list'

<ScrollFocusList />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `items` | Strategy, Research, Branding, Interfaces, Motion, Prototyping, Engineering, Content, Analytics, Support | Strategy, Research, Branding, Interfaces, Motion, Prototyping, Engineering, Content, Analytics, Support | ≤ 200 chars | Comma-separated |
| `size` | 48 | 48 | 28–72 px (best 36–60) | Font size |
| `inactiveOpacity` | 0.35 | 0.35 | 0.15–0.7 | Inactive opacity |
| `activeScale` | 1.08 | 1.08 | 1–1.2 | Active scale |
| `blur` | 1.5 | 1.5 | 0–4 px | Inactive blur |
| `entranceTilt` | 10 | 10 | 0–20 deg | Entrance tilt |
| `accent` | #f5a524 | #f5a524 | color | Centre mark color |
| `font` | sans | sans | sans / grotesk / serif | Font |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).

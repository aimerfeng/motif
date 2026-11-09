---
name: motif-stories-viewer
description: "A row of ringed avatars above a draggable strip of portrait story cards; the playing card slowly pans while a thin progress line fills, then hands over to the next author, and hover or focus previews any card. For social feeds, product updates and onboarding tours. Use when the user asks for Stories Viewer, 快拍浏览器, stories, carousel, avatar, social, feed, progress or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/stories-viewer"
  motif-item: "stories-viewer"
  params-hash: "5cab26d3"
---

# Stories Viewer (快拍浏览器)

A row of ringed avatars above a draggable strip of portrait story cards; the playing card slowly pans while a thin progress line fills, then hands over to the next author, and hover or focus previews any card. For social feeds, product updates and onboarding tours.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/stories-viewer.tsx` — the component (`StoriesViewer`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-stories-viewer`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/stories-viewer/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { StoriesViewer } from '@/components/motif/stories-viewer/stories-viewer'

<StoriesViewer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `duration` | 5 | 5 | 2–12 s (best 4–7) | Story duration |
| `autoplay` | true | true | boolean | Autoplay |
| `accent` | #ee2a7b | #ee2a7b | color | Ring accent |
| `radius` | 12 | 12 | 0–28 px (best 8–20) | Corner radius |
| `aspect` | portrait | portrait | portrait / tall / square | Card aspect |
| `showAvatars` | true | true | boolean | Avatar row |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).

---
name: motif-image-comparison
description: "Two images stacked with a divider you drag, click or arrow-key across, following on a spring; the Before / After labels step aside as the divider nears them. For photo edits, enhancement results, redesigns and renovation stories. Use when the user asks for Image Comparison, 前后对比滑块, before-after, compare, slider, image, reveal, photo, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/image-comparison"
  motif-item: "image-comparison"
  params-hash: "b4fc4f0f"
---

# Image Comparison (前后对比滑块)

Two images stacked with a divider you drag, click or arrow-key across, following on a spring; the Before / After labels step aside as the divider nears them. For photo edits, enhancement results, redesigns and renovation stories.

## When to use

- Use when the change between two states is the story: an edited photo, an enhanced render, an old and new design, a room before and after. Both images must share the same framing and size.

## Files

- `assets/image-comparison.tsx` — the component (`ImageComparison`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-image-comparison`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/image-comparison/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ImageComparison } from '@/components/motif/image-comparison/image-comparison'

<ImageComparison />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `position` | 50 | 50 | 5–95 % (best 30–70) | Where the divider starts, from the left edge |
| `interaction` | drag | drag | drag / hover | Interaction |
| `spring` | visualDuration 0.3, bounce 0.1 | visualDuration 0.3, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Shorter feels more direct |
| `handle` | circle | circle | circle / pill / line | Handle |
| `lineWidth` | 2 | 2 | 1–4 px | Line width |
| `lineColor` | #ffffff | #ffffff | color | Line color |
| `radius` | 18 | 18 | 0–32 px (best 8–24) | Corner radius |
| `labels` | true | true | boolean | Before / After labels |

## Rules

- Give the root a size (it defaults to a 16:10 aspect ratio); put ImageComparisonImage side="after" and side="before", then ImageComparisonSlider, inside it.
- Each image takes src + alt (rendered as an <img>) or arbitrary children, for example two renders of the same UI; label adds the corner chip.
- The divider is a real slider: it is focusable, arrow keys / Page keys / Home / End move it, and it reports its value. Keep a visible focus ring if you restyle the handle.
- Controlled use: value + onValueChange (0–100). Uncontrolled: the position param is the start.
- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).

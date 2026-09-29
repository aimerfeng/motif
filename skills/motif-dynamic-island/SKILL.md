---
name: motif-dynamic-island
description: "A black capsule that morphs between idle, now playing, device battery and an incoming call on a spring, with the content blurring in and out. A home for global notifications, progress and status. Use when the user asks for Dynamic Island, 灵动岛, dynamic island, notification, morph, spring, ios, status or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dynamic-island"
  motif-item: "dynamic-island"
  params-hash: "15ce488e"
---

# Dynamic Island (灵动岛)

A black capsule that morphs between idle, now playing, device battery and an incoming call on a spring, with the content blurring in and out. A home for global notifications, progress and status.

## When to use

- Docks, bars and menus where motion explains spatial relationships.

## Files

- `assets/dynamic-island.tsx` — the component (`DynamicIsland`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dynamic-island/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DynamicIsland } from '@/components/motif/dynamic-island/dynamic-island'

<DynamicIsland />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `spring` | visualDuration 0.55, bounce 0.3 | visualDuration 0.55, bounce 0.3 | visualDuration s, bounce 0–1 | Morph spring |
| `autoplay` | true | true | boolean | Cycles through the states; click the island to advance by hand |
| `dwell` | 2 | 2 | 1–6 s (best 1.6–3.5) | Time per state |
| `scale` | 1 | 1 | 0.7–1.6 x (best 0.8–1.4) | Scale |
| `background` | #000000 | #000000 | color | Island color |
| `accent` | #30d158 | #30d158 | color | Accent |
| `shine` | true | true | boolean | Rim light |

## Rules

- Navigation must stay usable with the keyboard; motion is decoration on top.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).

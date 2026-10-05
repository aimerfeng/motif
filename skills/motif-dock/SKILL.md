---
name: motif-dock
description: "Icons swell smoothly as the pointer nears them and pull their neighbors along, like the macOS dock. Great for app navigation, toolbars and portfolio link bars. Use when the user asks for Dock, 放大坞, dock, magnify, macos, toolbar, hover, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dock"
  motif-item: "dock"
  params-hash: "f35b1eea"
---

# Dock (放大坞)

Icons swell smoothly as the pointer nears them and pull their neighbors along, like the macOS dock. Great for app navigation, toolbars and portfolio link bars.

## When to use

- Docks, bars and menus where motion explains spatial relationships.

## Files

- `assets/dock.tsx` — the component (`Dock`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dock`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dock/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Dock } from '@/components/motif/dock/dock'

<Dock />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `iconSize` | 48 | 48 | 28–72 px (best 36–60) | Icon size |
| `iconMagnification` | 80 | 80 | 40–128 px (best 60–104) | Magnified size |
| `iconDistance` | 150 | 150 | 60–320 px (best 100–220) | How far from an icon the swell starts |
| `gap` | 8 | 8 | 0–24 px (best 4–14) | Gap |
| `spring` | visualDuration 0.28, bounce 0.25 | visualDuration 0.28, bounce 0.25 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `direction` | bottom | bottom | bottom / middle / top | Grow toward |
| `disableMagnification` | false | false | boolean | Disable magnification |

## Rules

- Navigation must stay usable with the keyboard; motion is decoration on top.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

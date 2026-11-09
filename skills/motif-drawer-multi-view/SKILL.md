---
name: motif-drawer-multi-view
description: "A rounded floating bottom sheet that moves between views (options, a confirm step, a success state) while its height eases to fit and the content cross-fades. Drag down to dismiss, focus stays inside, Esc closes. For account actions, security settings and checkout confirmations. Use when the user asks for Multi-View Drawer, 多视图抽屉, drawer, bottom-sheet, multi-step, views, height-animation, confirmation, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/drawer-multi-view"
  motif-item: "drawer-multi-view"
  params-hash: "5b24c9e3"
---

# Multi-View Drawer (多视图抽屉)

A rounded floating bottom sheet that moves between views (options, a confirm step, a success state) while its height eases to fit and the content cross-fades. Drag down to dismiss, focus stays inside, Esc closes. For account actions, security settings and checkout confirmations.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/drawer-multi-view.tsx` — the component (`FamilyDrawerRoot`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-drawer-multi-view`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/drawer-multi-view/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FamilyDrawerRoot } from '@/components/motif/drawer-multi-view/drawer-multi-view'

<FamilyDrawerRoot />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `radius` | 36 | 36 | 16–44 px (best 24–40) | Corner radius |
| `maxWidth` | 361 | 361 | 320–480 px (best 340–420) | On narrow screens it keeps a 16px gutter |
| `backdrop` | 0.3 | 0.3 | 0–0.8 (best 0.2–0.6) | Backdrop dim |
| `duration` | 0.27 | 0.27 | 0.12–0.8 s (best 0.2–0.45) | Height duration |
| `ease` | 0.25, 1, 0.5, 1 | 0.25, 1, 0.5, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Height easing |
| `viewScale` | 0.96 | 0.96 | 0.85–1 (best 0.92–1) | Views scale in and out from this value; 1 is a plain cross-fade |
| `dragDismiss` | true | true | boolean | Drag to dismiss |

## Rules

- Compose FamilyDrawerRoot > Trigger + Portal > Overlay + Content > Close + AnimatedWrapper > AnimatedContent > ViewContent, and register views by name; views switch with setView from useFamilyDrawer().
- The sheet height follows the measured AnimatedWrapper, so keep each view short enough for a phone screen and do not give views fixed heights or their own scroll areas.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).

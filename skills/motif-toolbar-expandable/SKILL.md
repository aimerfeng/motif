---
name: motif-toolbar-expandable
description: "A row of icon buttons that grows the selected tool’s panel out of itself: the frame widens and rises on a spring, content slides between tools and a highlight glides to the active button. Arrow keys move, Esc collapses, clicking outside closes. For floating control bars, editor toolbars and smart-home panels. Use when the user asks for Expandable Toolbar, 展开式工具栏, toolbar, panel, expand, morph, layout animation, spring, keyboard or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/toolbar-expandable"
  motif-item: "toolbar-expandable"
  params-hash: "31c771b8"
---

# Expandable Toolbar (展开式工具栏)

A row of icon buttons that grows the selected tool’s panel out of itself: the frame widens and rises on a spring, content slides between tools and a highlight glides to the active button. Arrow keys move, Esc collapses, clicking outside closes. For floating control bars, editor toolbars and smart-home panels.

## When to use

- Use for a small set (3–6) of tools that each need a compact panel: playback, lights, filters, share. If panels hold forms the user fills in for a while, use a dialog or drawer instead.

## Files

- `assets/toolbar-expandable.tsx` — the component (`ToolbarExpandable`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-toolbar-expandable`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/toolbar-expandable/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ToolbarExpandable } from '@/components/motif/toolbar-expandable/toolbar-expandable'

<ToolbarExpandable />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `spring` | visualDuration 0.32, bounce 0.12 | visualDuration 0.32, bounce 0.12 | visualDuration 0.05–4 s, bounce 0–0.9 | Expand spring |
| `contentTransition` | slide | slide | slide / fade / blur | Content switch |
| `placement` | top | top | top / bottom | Panel placement |
| `panelWidth` | 300 | 300 | 220–380 px (best 260–340) | Width when open; never narrower than the toolbar itself |
| `buttonSize` | 40 | 40 | 32–48 px (best 36–44) | Button size |
| `radius` | 20 | 20 | 8–28 px (best 14–24) | Corner radius |
| `indicator` | pill | pill | pill / dot | Active marker |
| `closeOnOutsideClick` | true | true | boolean | Close on outside click |

## Rules

- Pass items as [{ id, label, icon, content }]; label is the accessible name of the icon button, so make it a clear noun ("Lights", "Climate").
- Keep panels compact (under about 260 px tall) and similar in height so the frame does not jump far between tools.
- The toolbar uses a roving tab stop: Tab enters on the active button, arrows / Home / End move between buttons, Enter or Space toggles, Esc collapses and keeps focus on the button. The panel follows the toolbar in tab order.
- Controlled use: active + onActiveChange (null when collapsed).
- Navigation must stay usable with the keyboard; motion is decoration on top.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).

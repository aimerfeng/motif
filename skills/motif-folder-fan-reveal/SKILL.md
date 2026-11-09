---
name: motif-folder-fan-reveal
description: "A folder drawn from a real silhouette — raised tab, shaded front flap, inner well — whose flap tips back as the papers inside fan out on hover or click. For project pickers, file drops and portfolio categories. Use when the user asks for Folder Reveal, 文件夹展开, folder, files, fan, reveal, hover, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/folder-fan-reveal"
  motif-item: "folder-fan-reveal"
  params-hash: "ad254e16"
---

# Folder Reveal (文件夹展开)

A folder drawn from a real silhouette — raised tab, shaded front flap, inner well — whose flap tips back as the papers inside fan out on hover or click. For project pickers, file drops and portfolio categories.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/folder-fan-reveal.tsx` — the component (`FolderReveal`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-folder-fan-reveal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/folder-fan-reveal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FolderReveal } from '@/components/motif/folder-fan-reveal/folder-fan-reveal'

<FolderReveal />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | manila | manila | manila / brand / blue / green / slate | Folder stock |
| `spread` | 62 | 62 | 30–80 px (best 44–72) | Horizontal distance between fanned cards |
| `rotation` | 7 | 7 | 0–14 deg (best 3–10) | Degrees of rotation per card |
| `size` | 260 | 260 | 180–320 px (best 200–300) | Folder width |
| `trigger` | hover | hover | hover / click | Trigger |
| `itemCount` | 3 | 3 | 1–5 (best 2–4) | Maximum number of cards shown |
| `label` | Folder | Folder | ≤ 16 chars | Label |

## Rules

- Pass items as { id, content, color? }; cards are sized from the folder width, so keep their content small (a title line and a size).
- Hover only opens on hover-capable pointers; keyboard focus opens it too. Use trigger="click" for touch-first layouts, or control it with open + onOpenChange.
- The fanned cards extend past the folder; leave about one card height of room above it.
- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).

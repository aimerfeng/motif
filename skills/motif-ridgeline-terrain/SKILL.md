---
name: motif-ridgeline-terrain
description: "Dozens of stacked ridgelines with hidden-line occlusion form a noise-driven terrain that rolls slowly toward you, its peaks gathered in the middle like a signal chart. For music, data-journalism and editorial cover heroes. Use when the user asks for Ridgeline Terrain, 山脊线图, ridgeline, terrain, lines, joyplot, canvas, generative, editorial or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ridgeline-terrain"
  motif-item: "ridgeline-terrain"
  params-hash: "1a784c38"
---

# Ridgeline Terrain (山脊线图)

Dozens of stacked ridgelines with hidden-line occlusion form a noise-driven terrain that rolls slowly toward you, its peaks gathered in the middle like a signal chart. For music, data-journalism and editorial cover heroes.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/ridgeline-terrain.tsx` — the component (`RidgelineTerrain`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ridgeline-terrain`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ridgeline-terrain/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RidgelineTerrain } from '@/components/motif/ridgeline-terrain/ridgeline-terrain'

<RidgelineTerrain />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `lines` | 56 | 56 | 24–90 (best 36–72) | Lines |
| `amplitude` | 0.62 | 0.62 | 0.35–0.9 (best 0.4–0.8) | How tall the peaks rise relative to the frame |
| `sharpness` | 0.6 | 0.6 | 0–1 | From rolling hills to needle-sharp signal peaks |
| `centerWeight` | 0.8 | 0.8 | 0–1 | Higher values gather the peaks in the middle and flatten the sides |
| `perspective` | 0.35 | 0.35 | 0–1 | At 0 an evenly stacked chart; higher values look down on terrain stretching to the horizon |
| `scroll` | 1.2 | 1.2 | 0–4 (best 0.4–2.5) | Rows per second rolling toward the viewer |
| `lineWidth` | 1.4 | 1.4 | 0.6–2.4 px (best 0.8–2) | Line width |
| `ink` | #f2eee6 | #f2eee6 | color | Ink |
| `background` | #0b0b0d | #0b0b0d | color | Background |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

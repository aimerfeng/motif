---
name: motif-rocker-glass
description: "A liquid-glass cap sitting in a recessed well that tilts in like a rocker switch when pressed, with highlights, shadows and a bead LED following along. Suits hero CTAs, device panels and tactile interfaces. Use when the user asks for Glass Rocker, 玻璃翘板键, button, rocker, glass, skeuomorphic, tactile, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/rocker-glass"
  motif-item: "rocker-glass"
  params-hash: "ebbbe904"
---

# Glass Rocker (玻璃翘板键)

A liquid-glass cap sitting in a recessed well that tilts in like a rocker switch when pressed, with highlights, shadows and a bead LED following along. Suits hero CTAs, device panels and tactile interfaces.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/rocker-glass.tsx` — the component (`RockerGlass`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-rocker-glass`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/rocker-glass/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RockerGlass } from '@/components/motif/rocker-glass/rocker-glass'

<RockerGlass />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Get Started | Get Started | ≤ 24 chars | Label |
| `size` | default | default | sm / default / lg | Size |
| `indicatorColor` | blue | blue | blue / green / amber / red / slate | Indicator color |
| `showIndicator` | true | true | boolean | Show indicator |
| `spring` | visualDuration 0.55, bounce 0.45 | visualDuration 0.55, bounce 0.45 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- The cap is a fixed light glass; place it on a light or mid-tone surface, not on a dark background.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).

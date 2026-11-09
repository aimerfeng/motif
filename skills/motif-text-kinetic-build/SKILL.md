---
name: motif-text-kinetic-build
description: "A keynote-style build: each new word slides in from the right with a short blur and nudges the line so the growing phrase stays centred; once it locks, the phrase lifts away and the next begins. For hero taglines, event intros and launch pages. Use when the user asks for Kinetic Word Build, 逐词推入, text, keynote, word build, headline, hero, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/inter-tight, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-kinetic-build"
  motif-item: "text-kinetic-build"
  params-hash: "3e6ab24c"
---

# Kinetic Word Build (逐词推入)

A keynote-style build: each new word slides in from the right with a short blur and nudges the line so the growing phrase stays centred; once it locks, the phrase lifts away and the next begins. For hero taglines, event intros and launch pages.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/kinetic-center-build.tsx` — the component (`KineticCenterBuild`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-kinetic-build`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/inter-tight @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-kinetic-build/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { KineticCenterBuild } from '@/components/motif/text-kinetic-build/kinetic-center-build'

<KineticCenterBuild />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `phrases` | Designed for the way you work \| Built to ship on day one \| Made by a team of four | Designed for the way you work \| Built to ship on day one \| Made by a team of four | ≤ 240 chars | Separated by /, shown in order and looped |
| `wordInterval` | 0.43 | 0.43 | 0.15–1.2 s | Word interval |
| `pushDuration` | 0.43 | 0.43 | 0.15–1.2 s | Push duration |
| `holdTime` | 2.5 | 2.5 | 0.5–6 s | Hold time |
| `entryOffset` | 88 | 88 | 0–240 px | Entry offset |
| `entryBlur` | 3.5 | 3.5 | 0–12 px | Entry blur |
| `fontSize` | 56 | 56 | 24–96 px | Font size |
| `font` | sans | sans | sans / serif / grotesk | Font |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).

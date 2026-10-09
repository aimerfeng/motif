---
name: motif-shooting-stars
description: "Streaks with glowing heads cross a deep teal night while the stars behind them twinkle, with a warm glow along the horizon. A hero backdrop, 404 page or event splash. Use when the user asks for Shooting Stars, 流星夜空, stars, night, sky, meteor, canvas, ambient or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/shooting-stars"
  motif-item: "shooting-stars"
  params-hash: "c2686c3e"
---

# Shooting Stars (流星夜空)

Streaks with glowing heads cross a deep teal night while the stars behind them twinkle, with a warm glow along the horizon. A hero backdrop, 404 page or event splash.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/shooting-stars.tsx` — the component (`ShootingStars`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-shooting-stars`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/shooting-stars/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShootingStars } from '@/components/motif/shooting-stars/shooting-stars'

<ShootingStars />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `skyTop` | #06161d | #06161d | color | Sky top |
| `skyBottom` | #0d3a40 | #0d3a40 | color | Sky bottom |
| `glowColor` | #f59e0b | #f59e0b | color | Horizon glow |
| `stars` | 90 | 90 | 0–300 (best 40–200) | Stars per 1280x720 of area |
| `colors` | #ffffff, #9ff0e0, #ffd9a0 | #ffffff, #9ff0e0, #ffd9a0 | 1–4 colors | Each streak picks one |
| `count` | 16 | 16 | 4–40 (best 8–28) | Streak count |
| `length` | 170 | 170 | 80–320 px (best 110–260) | Tail length |
| `angle` | 24 | 24 | 8–55 deg (best 15–42) | Downward tilt from horizontal |
| `speed` | 1 | 1 | 0.3–2.5 x (best 0.6–1.8) | Speed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).

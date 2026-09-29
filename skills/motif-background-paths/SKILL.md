---
name: motif-background-paths
description: "A fan of gradient curves spreads across the screen like silk ribbons, with streaks of light flowing along each line. A quiet backdrop for hero sections, launch pages and empty states. Use when the user asks for Background Paths, 流线背景, background, svg, paths, lines, gradient, flow or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/background-paths"
  motif-item: "background-paths"
  params-hash: "9bf14df4"
---

# Background Paths (流线背景)

A fan of gradient curves spreads across the screen like silk ribbons, with streaks of light flowing along each line. A quiet backdrop for hero sections, launch pages and empty states.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/background-paths.tsx` — the component (`BackgroundPaths`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/background-paths/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BackgroundPaths } from '@/components/motif/background-paths/background-paths'

<BackgroundPaths />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 40 | 40 | 12–80 (best 24–56) | Path count |
| `amplitude` | 1 | 1 | 0.3–2 x (best 0.6–1.5) | Wave amplitude |
| `mirror` | true | true | boolean | Adds a second fan opening from the other side |
| `strokeWidth` | 1.5 | 1.5 | 0.4–3 x (best 0.8–2.2) | Stroke width |
| `baseOpacity` | 0.12 | 0.12 | 0–0.5 (best 0.04–0.28) | Base line opacity |
| `colors` | #8b5cf6, #ec4899, #38bdf8 | #8b5cf6, #ec4899, #38bdf8 | 2–4 colors | Gradient colors |
| `speed` | 1 | 1 | 0.2–3 x (best 0.5–1.8) | Flow speed |
| `streak` | 16 | 16 | 4–45 % (best 8–30) | Streak length |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).

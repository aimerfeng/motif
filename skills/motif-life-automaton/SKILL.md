---
name: motif-life-automaton
description: "A cellular automaton evolving on a fine grid: living cells glow and leave phosphor trails that slowly fade. Switch between Life, HighLife, Day & Night and Brian’s Brain, and the pointer seeds new cells as it passes. A hero backdrop for developer tools, AI and science sites. Use when the user asks for Life Automaton, 生命游戏, cellular-automaton, game-of-life, grid, pixels, webgl, interactive, technical, science or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/life-automaton"
  motif-item: "life-automaton"
  params-hash: "3885253f"
---

# Life Automaton (生命游戏)

A cellular automaton evolving on a fine grid: living cells glow and leave phosphor trails that slowly fade. Switch between Life, HighLife, Day & Night and Brian’s Brain, and the pointer seeds new cells as it passes. A hero backdrop for developer tools, AI and science sites.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/life-automaton.tsx` — the component (`LifeAutomaton`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-life-automaton`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/life-automaton/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LifeAutomaton } from '@/components/motif/life-automaton/life-automaton'

<LifeAutomaton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `rule` | life | life | life / highlife / daynight / brain | Rule |
| `generationsPerSecond` | 12 | 12 | 3–30 (best 6–20) | Generations per second |
| `activity` | 45 | 45 | 0–100 % (best 20–75) | How often fresh soup drops in: low lets the field thin out to still lifes and gliders, high keeps it churning; under Day & Night it sets how often islands and lakes appear |
| `cellSize` | 7 | 7 | 4–14 px (best 5–11) | Cell size |
| `trailDecay` | 1.4 | 1.4 | 0.2–4 s (best 0.6–2.6) | How long a cell keeps glowing after it dies, at any refresh rate |
| `aliveColor` | #dff4ff | #dff4ff | color | Live cells |
| `trailColor` | #3168f5 | #3168f5 | color | Trail |
| `background` | #05070d | #05070d | color | Background |
| `brush` | 3 | 3 | 0–8 | Radius in cells of the soup the pointer paints; 0 turns painting off |

## Rules

- Layer content on top as children. The field is busy, so give headlines a solid or softly blurred panel, or pull the cell and trail colors toward the background for a quieter field behind long copy.
- Hovering paints soup along the pointer path and a click plants a larger colony, except on links, buttons and form fields; set brush to 0 for a purely ambient background.
- Activity sets how often fresh soup drops in: Life and HighLife keep churning instead of thinning out to still lifes, and Day & Night (a bistable rule that otherwise floods or empties) gets islands and lakes of both phases, steered by a live-cell census so about 30–45% of the field stays lit. Changing the rule starts a new run; resizing keeps the pattern and only fills the newly exposed edges.
- Under prefers-reduced-motion it renders one settled generation with its trails and stops; painting still places cells but nothing evolves.
- Keep live cells the brightest color and the trail a mid-tone between them and the background; on light backgrounds use dark ink for live cells.
- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file.

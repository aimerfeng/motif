---
name: motif-particle-button
description: "A click bursts colored sparks and a soft ring out of the button while the label flips to a done state. For send, save and submit actions that deserve a little ceremony. Use when the user asks for Particle Button, 粒子按钮, button, particles, confetti, click, feedback or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/particle-button"
  motif-item: "particle-button"
  params-hash: "bf57fe7a"
---

# Particle Button (粒子按钮)

A click bursts colored sparks and a soft ring out of the button while the label flips to a done state. For send, save and submit actions that deserve a little ceremony.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/particle-button.tsx` — the component (`ParticleButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/particle-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ParticleButton } from '@/components/motif/particle-button/particle-button'

<ParticleButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Send message | Send message | ≤ 24 chars | Label |
| `doneLabel` | Sent | Sent | ≤ 24 chars | Done label |
| `particleCount` | 20 | 20 | 6–40 (best 12–28) | Particles |
| `spread` | 104 | 104 | 40–160 px (best 60–120) | Spread |
| `particleSize` | 7 | 7 | 3–12 px (best 4–8) | Particle size |
| `duration` | 0.9 | 0.9 | 0.4–1.8 s (best 0.6–1.2) | Burst duration |
| `gravity` | 26 | 26 | 0–80 px (best 10–50) | How far particles drift down after the peak |
| `shape` | mix | mix | mix / dot / spark | Particle shape |
| `colors` | #a78bfa, #f472b6, #38bdf8, #fbbf24 | #a78bfa, #f472b6, #38bdf8, #fbbf24 | 2–6 colors | Particle colors |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).

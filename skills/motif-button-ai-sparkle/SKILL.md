---
name: motif-button-ai-sparkle
description: "A gradient pill whose sparkle icons twinkle at rest; on hover four-point stars appear around it and get pulled into the button, as if it were gathering magic. For AI generate, enhance and magic-fill actions. Use when the user asks for Sparkle Generate Button, 闪光生成按钮, button, ai, sparkle, particles, stars, hover, canvas or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-ai-sparkle"
  motif-item: "button-ai-sparkle"
  params-hash: "6f775512"
---

# Sparkle Generate Button (闪光生成按钮)

A gradient pill whose sparkle icons twinkle at rest; on hover four-point stars appear around it and get pulled into the button, as if it were gathering magic. For AI generate, enhance and magic-fill actions.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/button-ai-sparkle.tsx` — the component (`AiSparkleButton`); the tuned values are baked into its `defaults` object
- `assets/ai-sparkle.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-ai-sparkle`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-ai-sparkle/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AiSparkleButton } from '@/components/motif/button-ai-sparkle/button-ai-sparkle'

<AiSparkleButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Generate thumbnails | Generate thumbnails | ≤ 24 chars | Label |
| `gradient` | #93c5fd, #3b82f6, #a855f7 | #93c5fd, #3b82f6, #a855f7 | 2–4 colors | Laid out left to right; the outer ring uses a faint copy |
| `starColors` | #7c3aed, #bae6fd, #a78bfa, #93c5fd, #0284c7, #fafafa, #38bdf8 | #7c3aed, #bae6fd, #a78bfa, #93c5fd, #0284c7, #fafafa, #38bdf8 | 1–8 colors | Star colors |
| `starCount` | 20 | 20 | 6–40 (best 12–30) | Stars |
| `pullStrength` | 1 | 1 | 0.3–2.5 (best 0.6–1.6) | How hard stars are drawn into the center |
| `twinkleSpeed` | 1 | 1 | 0.4–2.5 (best 0.7–1.5) | Twinkle speed |
| `hoverScale` | 1.1 | 1.1 | 1–1.2 (best 1.04–1.12) | Hover scale |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).

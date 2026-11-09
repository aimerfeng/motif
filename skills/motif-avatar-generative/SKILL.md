---
name: motif-avatar-generative
description: "A deterministic 6×6 pixel avatar generated from any name or ID: cells pulse and breathe, a diagonal wave sweeps across and the odd pixel sparkles. Same seed, same face everywhere. For agents, bots, new users and workspaces without a photo. Use when the user asks for Generative Avatar, 生成式头像, avatar, identicon, generative, pixel, agent, canvas, fallback or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/avatar-generative"
  motif-item: "avatar-generative"
  params-hash: "1b9a2307"
---

# Generative Avatar (生成式头像)

A deterministic 6×6 pixel avatar generated from any name or ID: cells pulse and breathe, a diagonal wave sweeps across and the odd pixel sparkles. Same seed, same face everywhere. For agents, bots, new users and workspaces without a photo.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/avatar-generative.tsx` — the component (`AvatarGenerative`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-avatar-generative`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/avatar-generative/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AvatarGenerative } from '@/components/motif/avatar-generative/avatar-generative'

<AvatarGenerative />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `seed` | atlas-agent | atlas-agent | ≤ 48 chars | A name, email or ID; the same seed always gives the same face |
| `size` | 64 | 64 | 24–160 px (best 32–128) | Diameter |
| `animated` | true | true | boolean | Pixel animation |
| `speed` | 1 | 1 | 0.2–3 x (best 0.5–2) | Speed |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).

---
name: motif-neon-gradient-card
description: "A neon gradient rims the card while a wide glow of the same colors spills out behind it, drifting slowly from one end of the gradient to the other like a lit sign at night. For event tickets, live announcements and the one card that should own the screen. Use when the user asks for Neon Gradient Card, 霓虹渐变卡片, card, neon, glow, gradient, border, backlight or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/syne, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/neon-gradient-card"
  motif-item: "neon-gradient-card"
  params-hash: "3dc5af16"
---

# Neon Gradient Card (霓虹渐变卡片)

A neon gradient rims the card while a wide glow of the same colors spills out behind it, drifting slowly from one end of the gradient to the other like a lit sign at night. For event tickets, live announcements and the one card that should own the screen.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/neon-gradient-card.tsx` — the component (`NeonGradientCard`); the tuned values are baked into its `defaults` object
- `assets/neon-gradient-card.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-neon-gradient-card`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/syne clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/neon-gradient-card/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/syne';` to the global stylesheet.
4. Use it:

```tsx
import { NeonGradientCard } from '@/components/motif/neon-gradient-card/neon-gradient-card'

<NeonGradientCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #ff00aa, #00fff1 | #ff00aa, #00fff1 | 2–4 colors | Laid out bottom to top as a gradient |
| `borderSize` | 2 | 2 | 1–6 px (best 1.5–4) | Border width |
| `borderRadius` | 20 | 20 | 8–32 px (best 12–28) | Corner radius |
| `glowSize` | 56 | 56 | 16–120 px (best 32–90) | Blur radius of the light behind the card |
| `glowOpacity` | 0.8 | 0.8 | 0–1 (best 0.4–0.95) | Glow strength |
| `duration` | 3 | 3 | 1.5–10 s (best 2.4–6) | Time to drift from one end to the other; it then drifts back |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

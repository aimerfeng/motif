---
name: motif-card-disclosure
description: "A cover card whose caption bar springs up into a full details panel when tapped, while the artwork behind it scales up and softly blurs; tap again to tuck it away. For gallery items, event cards and product tiles. Use when the user asks for Disclosure Card, 揭示卡片, card, disclosure, reveal, spring, blur, expand or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/card-disclosure"
  motif-item: "card-disclosure"
  params-hash: "25732fc8"
---

# Disclosure Card (揭示卡片)

A cover card whose caption bar springs up into a full details panel when tapped, while the artwork behind it scales up and softly blurs; tap again to tuck it away. For gallery items, event cards and product tiles.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/card-disclosure.tsx` — the component (`DisclosureCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-card-disclosure`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/card-disclosure/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DisclosureCard } from '@/components/motif/card-disclosure/card-disclosure'

<DisclosureCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `trigger` | click | click | click / hover | The caption bar always works with click and keyboard |
| `spring` | visualDuration 0.5, bounce 0.12 | visualDuration 0.5, bounce 0.12 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `coverZoom` | 1.1 | 1.1 | 1–1.3 (best 1.04–1.2) | Cover zoom |
| `coverBlur` | 3 | 3 | 0–10 px (best 1–6) | Cover blur |
| `panelColor` | #18181b | #18181b | color | Text switches between light and dark ink by luminance |
| `radius` | 12 | 12 | 0–28 px (best 8–20) | Corner radius |
| `lineClamp` | 3 | 3 | 1–6 (best 2–4) | Body lines |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).

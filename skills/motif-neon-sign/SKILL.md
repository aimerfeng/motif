---
name: motif-neon-sign
description: "Hand-bent neon tube lettering with glass tubing, electrodes, layered bloom and light spilling onto the wall. The whole sign breathes slowly while one letter stutters like a failing transformer. For bar, music, nightlife and retro brand headings. Use when the user asks for Neon Sign, 霓虹招牌, neon, sign, glow, flicker, typography, retro, nightlife, canvas2d or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/neon-sign"
  motif-item: "neon-sign"
  params-hash: "74727fca"
---

# Neon Sign (霓虹招牌)

Hand-bent neon tube lettering with glass tubing, electrodes, layered bloom and light spilling onto the wall. The whole sign breathes slowly while one letter stutters like a failing transformer. For bar, music, nightlife and retro brand headings.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/neon-sign.tsx` — the component (`NeonSign`); the tuned values are baked into its `defaults` object
- `assets/glyphs.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-neon-sign`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/neon-sign/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NeonSign } from '@/components/motif/neon-sign/neon-sign'

<NeonSign />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | GLASS/BLOWN | GLASS/BLOWN | ≤ 32 chars | Use / for a new line; A–Z, 0–9 and - + . ! ? ' are supported, anything else is skipped |
| `tubeColor` | #ff2a96 | #ff2a96 | color | Brightness is normalized so the tube always glows |
| `glow` | 1 | 1 | 0.4–1.6 x (best 0.7–1.3) | Strength of the bloom and the spill on the wall |
| `electrodes` | true | true | boolean | Dark electrode caps at both ends of each line |
| `wallColor` | #090909 | #090909 | color | Wall |
| `flicker` | 1 | 1 | 0–2.5 x (best 0.3–1.6) | How often the faulty letter stutters; 0 keeps it steady |
| `breath` | 1 | 1 | 0–2 x (best 0–1.5) | How much the whole sign slowly swells and dims |
| `lineGap` | 0.46 | 0.46 | 0.2–0.9 | Relative to the letter height |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).

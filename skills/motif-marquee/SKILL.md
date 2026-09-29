---
name: motif-marquee
description: "Endless, seamless scrolling with soft faded edges, horizontal or vertical, reversible, pausing on hover. Made for testimonial walls, partner strips and tag clouds. Use when the user asks for Marquee, 无限跑马灯, marquee, ticker, scroll, testimonials, logos, infinite or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/marquee"
  motif-item: "marquee"
  params-hash: "859bebed"
---

# Marquee (无限跑马灯)

Endless, seamless scrolling with soft faded edges, horizontal or vertical, reversible, pausing on hover. Made for testimonial walls, partner strips and tag clouds.

## When to use

- Lists, grids and panels whose items enter, reorder or expand.

## Files

- `assets/marquee.tsx` — the component (`Marquee`); the tuned values are baked into its `defaults` object
- `assets/marquee.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/marquee/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Marquee } from '@/components/motif/marquee/marquee'

<Marquee />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `duration` | 28 | 28 | 6–90 s (best 14–50) | Loop duration |
| `gap` | 16 | 16 | 0–64 px (best 8–32) | Gap |
| `repeat` | 4 | 4 | 2–8 | Raise it for short content in wide containers so no gap shows |
| `reverse` | false | false | boolean | Reverse |
| `pauseOnHover` | true | true | boolean | Pause on hover |
| `vertical` | false | false | boolean | Vertical |
| `fade` | true | true | boolean | Fade edges |

## Rules

- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

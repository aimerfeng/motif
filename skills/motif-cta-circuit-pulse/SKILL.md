---
name: motif-cta-circuit-pulse
description: "A tall closing section on a faint radially masked grid, with circuit traces down both sides where a glowing dot runs along each path, a blur-in gradient headline and a pill button whose label rolls up on hover. For developer tools and analytics products. Use when the user asks for Circuit Pulse CTA, 电路光脉 CTA, cta, call to action, circuit, grid, pulse, developer or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/cta-circuit-pulse"
  motif-item: "cta-circuit-pulse"
  params-hash: "ebcec05c"
---

# Circuit Pulse CTA (电路光脉 CTA)

A tall closing section on a faint radially masked grid, with circuit traces down both sides where a glowing dot runs along each path, a blur-in gradient headline and a pill button whose label rolls up on hover. For developer tools and analytics products.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/cta-circuit-pulse.tsx` — the component (`CtaCircuitPulse`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-cta-circuit-pulse`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/cta-circuit-pulse/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CtaCircuitPulse } from '@/components/motif/cta-circuit-pulse/cta-circuit-pulse'

<CtaCircuitPulse />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `headline` | Lightweight Analytics Built For Simplicity | Lightweight Analytics Built For Simplicity | ≤ 60 chars | Headline |
| `buttonLabel` | Get Started | Get Started | ≤ 22 chars | Button label |
| `accent` | #3b82f6 | #3b82f6 | color | Pulse color |
| `tone` | dark | dark | dark / light | Tone |
| `gridSize` | 48 | 48 | 24–96 px (best 32–72) | Grid size |
| `traceShape` | elbow | elbow | elbow / zigzag / straight | Trace shape |
| `pulseSpeed` | 3 | 3 | 1.5–8 s (best 2–5) | Pulse period |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from karthikmudunuri/eldoraui).

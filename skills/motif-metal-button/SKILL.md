---
name: motif-metal-button
description: "A polished metal ring wraps the button: reflections drift around it while a second highlight sweeps the other way, so glints split and merge and the halo brightens with them. Chrome, chromatic, gold and titanium finishes. For hardware, pro tools and premium plans. Use when the user asks for Metal Button, 金属环按钮, button, metal, chrome, ring, glow, premium, conic-gradient or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/metal-button"
  motif-item: "metal-button"
  params-hash: "fb035181"
---

# Metal Button (金属环按钮)

A polished metal ring wraps the button: reflections drift around it while a second highlight sweeps the other way, so glints split and merge and the halo brightens with them. Chrome, chromatic, gold and titanium finishes. For hardware, pro tools and premium plans.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/metal-button.tsx` — the component (`MetalButton`); the tuned values are baked into its `defaults` object
- `assets/metal-button.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-metal-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/metal-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MetalButton } from '@/components/motif/metal-button/metal-button'

<MetalButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Connect device | Connect device | ≤ 24 chars | Label |
| `finish` | chromatic | chromatic | chromatic / chrome / gold / titanium | Finish |
| `face` | graphite | graphite | graphite / silver / accent | Face |
| `ringWidth` | 3 | 3 | 1.5–5 px (best 2–4) | Ring width |
| `radius` | 24 | 24 | 6–24 px (best 10–24) | Corner radius |
| `strength` | 0.9 | 0.9 | 0.3–1 (best 0.6–1) | Lower values give a satin finish |
| `glow` | 0.6 | 0.6 | 0–1 (best 0.3–0.8) | Glow |
| `speed` | 7 | 7 | 3–20 s (best 5–12) | Reflection lap |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).

---
name: motif-button-share-reveal
description: "On hover or focus the Share button fades out and a row of share targets slides in with a stagger; the chosen icon gives a small press pulse. For article footers, product pages and invite flows. Use when the user asks for Share Reveal Button, 分享展开按钮, share, button, reveal, stagger, social or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-share-reveal"
  motif-item: "button-share-reveal"
  params-hash: "79ebf263"
---

# Share Reveal Button (分享展开按钮)

On hover or focus the Share button fades out and a row of share targets slides in with a stagger; the chosen icon gives a small press pulse. For article footers, product pages and invite flows.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/button-share-reveal.tsx` — the component (`ShareRevealButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-share-reveal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-share-reveal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShareRevealButton } from '@/components/motif/button-share-reveal/button-share-reveal'

<ShareRevealButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Share | Share | ≤ 14 chars | Label |
| `targets` | 4 | 4 | 2–5 (best 3–5) | Targets |
| `tone` | mono | mono | mono / primary | Tone |
| `radius` | 6 | 6 | 0–20 px (best 4–12) | Corner radius |
| `iconSize` | 16 | 16 | 14–20 px | Icon size |
| `duration` | 0.3 | 0.3 | 0.15–0.6 s | Duration |
| `stagger` | 0.05 | 0.05 | 0–0.12 s | Stagger |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).

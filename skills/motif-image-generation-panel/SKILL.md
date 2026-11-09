---
name: motif-image-generation-panel
description: "A text-to-image console: a prompt composer with style chips and an aspect-ratio switch, above a batch of tiles that each resolve from a blurred mosaic to sharp under a travelling scan line, with live percentages and seeds, then select, download and variation actions. For creative AI products and model playgrounds. Use when the user asks for Image Generation Panel, 文生图控制台, ai, image generation, text to image, prompt, progress, mosaic, scan, playground or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/image-generation-panel"
  motif-item: "image-generation-panel"
  params-hash: "9aa3b522"
---

# Image Generation Panel (文生图控制台)

A text-to-image console: a prompt composer with style chips and an aspect-ratio switch, above a batch of tiles that each resolve from a blurred mosaic to sharp under a travelling scan line, with live percentages and seeds, then select, download and variation actions. For creative AI products and model playgrounds.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/image-generation-panel.tsx` — the component (`ImageGenerationPanel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-image-generation-panel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/image-generation-panel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ImageGenerationPanel } from '@/components/motif/image-generation-panel/image-generation-panel'

<ImageGenerationPanel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 4 | 4 | 1–4 (best 2–4) | Images per batch |
| `aspectRatio` | 16 / 9 | 16 / 9 | 1 / 1 / 4 / 5 / 16 / 9 | Initial ratio; the switch in the panel can still change it |
| `composerPlacement` | top | top | top / bottom | Composer placement |
| `chrome` | full | full | full / minimal | Minimal drops the header, footer and seed readout |
| `accent` | #fe65b0 | #fe65b0 | color | Scan trail, progress bars, status dot and caret |
| `scanDuration` | 1.9 | 1.9 | 1–3.5 s (best 1.4–2.6) | Scan pass duration |
| `model` | atelier-diffusion v2 | atelier-diffusion v2 | ≤ 28 chars | Model name |

## Rules

- The panel does not generate anything: pass images (src plus an optional tiny preview for the mosaic pass) and a 0-1 progress from your job, and drive status yourself or let onGenerate resolve to run the built-in queued -> generating -> done cycle.
- A preview of 16-48 px is what makes the first pass read as a colour mosaic of the real result; without it the full image is pixelated instead.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).

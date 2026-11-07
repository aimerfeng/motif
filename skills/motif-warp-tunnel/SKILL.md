---
name: motif-warp-tunnel
description: "Four grid walls recede into a perspective tunnel while colored beams streak along them from the depths toward the viewer, like jumping to warp. For launch events, campaign pages and heroes that want a sense of speed. Use when the user asks for Warp Tunnel, 曲速隧道, tunnel, perspective, grid, beams, speed, 3d or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/warp-tunnel"
  motif-item: "warp-tunnel"
  params-hash: "6a887080"
---

# Warp Tunnel (曲速隧道)

Four grid walls recede into a perspective tunnel while colored beams streak along them from the depths toward the viewer, like jumping to warp. For launch events, campaign pages and heroes that want a sense of speed.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/warp-tunnel.tsx` — the component (`WarpTunnel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-warp-tunnel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/warp-tunnel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WarpTunnel } from '@/components/motif/warp-tunnel/warp-tunnel'

<WarpTunnel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `perspective` | 100 | 100 | 50–320 px (best 70–220) | Lower values pull the tunnel in harder |
| `cellSize` | 5 | 5 | 2.5–10 % (best 3.5–8) | Share of the wall width; beams are one cell wide |
| `gridColor` | #c7d2fe | #c7d2fe | color | Grid color |
| `gridOpacity` | 0.14 | 0.14 | 0.03–0.5 (best 0.06–0.3) | Grid opacity |
| `beamsPerSide` | 4 | 4 | 1–6 (best 2–5) | Beams per wall |
| `colors` | #60a5fa, #a78bfa, #f472b6, #fbbf24 | #60a5fa, #a78bfa, #f472b6, #fbbf24 | 1–6 colors | Each beam picks one at random |
| `beamLength` | 1 | 1 | 0.4–2 x (best 0.6–1.6) | Beam length |
| `glow` | 0.35 | 0.35 | 0–1 | A soft light at the far end of the tunnel |
| `speed` | 1 | 1 | 0.2–3 x (best 0.5–2) | At 1x a beam crosses the tunnel in 3 seconds |
| `seed` | 3 | 3 | seed | Seed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).

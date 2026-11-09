---
name: motif-magnetic-field-lines
description: "Thousands of short iron filings line up around a few magnetic poles, gathering into chains that fan out radially at each pole; the poles drift slowly, the nearest one follows the pointer once it comes close, and glowing pulses run along the field from N to S, with an optional streamline mode. A backdrop for science, edtech and hardware pages. Use when the user asks for Magnetic Field Lines, 磁力线, magnetic, field lines, iron filings, physics, science, streamlines, canvas, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/magnetic-field-lines"
  motif-item: "magnetic-field-lines"
  params-hash: "31314bb5"
---

# Magnetic Field Lines (磁力线)

Thousands of short iron filings line up around a few magnetic poles, gathering into chains that fan out radially at each pole; the poles drift slowly, the nearest one follows the pointer once it comes close, and glowing pulses run along the field from N to S, with an optional streamline mode. A backdrop for science, edtech and hardware pages.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/magnetic-field-lines.tsx` — the component (`MagneticFieldLines`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-magnetic-field-lines`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/magnetic-field-lines/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MagneticFieldLines } from '@/components/motif/magnetic-field-lines/magnetic-field-lines'

<MagneticFieldLines />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mode` | filings | filings | filings / streamlines | Filings: thousands of short strokes aligned with the field, with pulses gliding along the chains; Streamlines: continuous field lines with flowing points of light |
| `poles` | 3 | 3 | 2–5 | N and S alternate; with an odd count the spare lines run off the edge |
| `density` | 1 | 1 | 0.75–1.5 x (best 0.85–1.3) | How close the filings sit; in streamline mode, how many lines leave each pole |
| `strokeLength` | 9 | 9 | 6–13 px (best 7–12) | The length of each filing; the pulse tails scale with it |
| `flowSpeed` | 1 | 1 | 0–2.5 x (best 0.4–1.6) | How fast pulses travel from N to S; 0 holds them still while the poles keep drifting |
| `ink` | #c3d5ff | #c3d5ff | color | Lightened or darkened automatically when it sits too close to the background |
| `background` | #05070c | #05070c | color | Background |
| `poleGlow` | 0.6 | 0.6 | 0–1 | At 0 the pole markers hide too, leaving only the filings |
| `grabRadius` | 25 | 25 | 0–50 % (best 12–35) | How close the pointer must come to a pole, as a share of the shorter side, before that pole follows it; 0 ignores the pointer entirely, for use behind body copy and buttons |

## Rules

- The field is computed from 2D point poles that alternate N and S, so every filing is aligned with the real field and the chains are exact field lines; keep 2–4 poles behind body copy and save 5 for full-bleed hero art.
- A pole follows the pointer only after the pointer comes within grabRadius of it (a share of the shorter side); it springs back to its orbit when the pointer leaves or flicks away. Behind body copy with links and buttons, lower grabRadius or set it to 0, and put headlines on a solid panel or in the calmer space between poles rather than right on a pole.
- On light backgrounds the filings are drawn as dark strokes without additive glow; pick an ink with clear contrast (it is nudged automatically when it is too close to the background).
- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.

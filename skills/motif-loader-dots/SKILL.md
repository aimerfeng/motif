---
name: motif-loader-dots
description: "Five dot rhythms: pulse, wave, bounce, typing and ellipsis, sharing count, spacing, color and speed. Made for chat typing indicators, buttons that are processing and load-more footers. Use when the user asks for Dot Loaders, 圆点加载器, loader, dots, typing, bounce, wave, loading, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-dots"
  motif-item: "loader-dots"
  params-hash: "d38e29b6"
---

# Dot Loaders (圆点加载器)

Five dot rhythms: pulse, wave, bounce, typing and ellipsis, sharing count, spacing, color and speed. Made for chat typing indicators, buttons that are processing and load-more footers.

## When to use

- Use for very short or open-ended waits inside a small footprint: chat typing, a processing button, load-more footers.

## Files

- `assets/loader-dots.tsx` — the component (`LoaderDots`); the tuned values are baked into its `defaults` object
- `assets/loader-dots.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-dots`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-dots/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderDots } from '@/components/motif/loader-dots/loader-dots'

<LoaderDots />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | pulse | pulse | pulse / wave / bounce / typing / ellipsis | Variant |
| `size` | 12 | 12 | 4–28 px (best 6–20) | Dot size |
| `color` | #8b5cf6 | #8b5cf6 | color | Color |
| `count` | 3 | 3 | 2–6 (best 3–5) | Dot count |
| `spacing` | 0.7 | 0.7 | 0.3–1.6 x (best 0.5–1.1) | As a multiple of the dot size |
| `speed` | 1 | 1 | 0.4–2.5 x (best 0.7–1.6) | Speed |
| `delay` | 0 | 0 | 0–1 s | Skips the loader for quick requests so it never flashes |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Keep role="status" and the sr-only label; set label to what is happening (for example "Ava is typing").
- Typing works best at 6-10 px dots in a neutral bubble; do not use more than 5 dots.
- Set delay to about 0.2 s when the request is usually fast so the dots never flash.
- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from GriffinJohnston/ldrs).

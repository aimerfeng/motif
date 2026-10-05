---
name: motif-loader-text-shimmer
description: "A band of light sweeps across the text to say \"thinking\" or \"generating\". Switch to a per-letter wave or a whole-line pulse. For AI chats, step logs and any wait that deserves one honest sentence. Use when the user asks for Text Shimmer, 文字流光, text, shimmer, ai, thinking, loading, status, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-text-shimmer"
  motif-item: "loader-text-shimmer"
  params-hash: "aa24de76"
---

# Text Shimmer (文字流光)

A band of light sweeps across the text to say "thinking" or "generating". Switch to a per-letter wave or a whole-line pulse. For AI chats, step logs and any wait that deserves one honest sentence.

## When to use

- Use for one-line status text during an open-ended wait, especially AI reasoning or generation. Pair with a short list of steps when the wait is long.

## Files

- `assets/loader-text-shimmer.tsx` — the component (`LoaderTextShimmer`); the tuned values are baked into its `defaults` object
- `assets/loader-text-shimmer.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-text-shimmer`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-text-shimmer/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderTextShimmer } from '@/components/motif/loader-text-shimmer/loader-text-shimmer'

<LoaderTextShimmer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Thinking through your request | Thinking through your request | ≤ 48 chars | Text |
| `variant` | sweep | sweep | sweep / wave / pulse | Variant |
| `size` | 20 | 20 | 12–48 px (best 14–32) | Font size |
| `duration` | 2.6 | 2.6 | 1–6 s (best 1.8–4) | Cycle time |
| `spread` | 16 | 16 | 5–45 (best 10–28) | Sweep only; clamped to 5-45 like prompt-kit |
| `baseColor` | #71717a | #71717a | color | Base color |
| `highlightColor` | #fafafa | #fafafa | color | Highlight |
| `angle` | 100 | 100 | 60–120 deg (best 80–110) | Angle |
| `delay` | 0 | 0 | 0–1 s | Show delay |

## Rules

- Keep the text specific ("Comparing pricing tiers") rather than generic ("Loading").
- The sweep highlight needs contrast against the background: choose highlightColor far from baseColor and check on light themes too.
- The visible text is aria-hidden and mirrored in an sr-only live region; keep role="status".
- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/prompt-kit).

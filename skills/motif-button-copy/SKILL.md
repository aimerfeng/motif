---
name: motif-button-copy
description: "One click copies to the clipboard: the icon morphs into a check drawn in one stroke, a halo ripples out, the label rolls over and a small confirmation pops up. Snippet, labeled button and icon-only styles. Made for install commands, invite links and API keys. Use when the user asks for Copy Button, 复制按钮, copy, clipboard, snippet, feedback, docs, button, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-copy"
  motif-item: "button-copy"
  params-hash: "58891f18"
---

# Copy Button (复制按钮)

One click copies to the clipboard: the icon morphs into a check drawn in one stroke, a halo ripples out, the label rolls over and a small confirmation pops up. Snippet, labeled button and icon-only styles. Made for install commands, invite links and API keys.

## When to use

- Use next to text the user is likely to paste elsewhere: commands, tokens, links, IDs. It writes the value prop to the clipboard.

## Files

- `assets/button-copy.tsx` — the component (`ButtonCopy`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-copy`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-copy/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ButtonCopy } from '@/components/motif/button-copy/button-copy'

<ButtonCopy />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | snippet | snippet | snippet / button / icon | Variant |
| `color` | #34d399 | #34d399 | color | Success color |
| `radius` | 12 | 12 | 4–24 px (best 6–18) | Corner radius |
| `size` | md | md | sm / md / lg | Size |
| `spring` | visualDuration 0.34, bounce 0.3 | visualDuration 0.34, bounce 0.3 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `value` | npx motif add tabs-animated | npx motif add tabs-animated | ≤ 64 chars | Text to copy |
| `label` | Copy | Copy | ≤ 14 chars | Used by the labeled button variant |
| `feedback` | 2 | 2 | 1–4 s (best 1.5–3) | Feedback time |

## Rules

- Pass the exact string to copy as value; the snippet variant also renders it. Never copy secrets that the user cannot see.
- Success and failure are announced through an aria-live region and a visible confirmation; do not add a second toast. If the Clipboard API is blocked it falls back to execCommand and finally shows "Press ⌘C".
- The icon and snippet variants get an aria-label of "Copy: <value>"; the button variant uses its visible label.
- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from xxtomm/spell-ui).
